import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SCAN_PROMPT = `You are a legal document analyst helping a parent navigate a custody or family law case.

When analyzing a document, follow this exact structure:

**DOCUMENT CONTENTS**
Report what the document actually says using its own exact wording and language as closely as possible. Preserve names, dates, dollar amounts, legal terms, obligations, and conditions exactly as written. Do not paraphrase or reinterpret — reflect what it literally states. Go section by section if the document has sections.

**WHAT THIS MEANS FOR YOU**
In plain everyday language, explain what the document means for the parent reading it. What are they required to do? What rights does it give or take away? What could happen if they don't comply?

**KEY DATES & DEADLINES**
List every date, deadline, or time-sensitive requirement mentioned in the document.

**RED FLAGS**
Flag anything urgent, concerning, or that requires immediate attention or legal advice.

**RECOMMENDED NEXT STEPS**
Give 2-3 concrete actions the parent should take now, this week, or before the next deadline.

Be specific and practical. Never predict court outcomes. Always suggest consulting a lawyer for advice specific to their situation.`;

export async function POST(request) {
  try {
    const { documentId, userId, prompt: customPrompt } = await request.json();
    const activePrompt = customPrompt || SCAN_PROMPT;

    if (!documentId || !userId) {
      return NextResponse.json({ error: 'documentId and userId are required' }, { status: 400 });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('tier, pdf_trial_used, monthly_pdf_scans_used')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    if (user.tier === 'bronze') {
      if (user.pdf_trial_used >= 1) {
        return NextResponse.json({
          error: 'Trial limit reached',
          upgradeRequired: true,
          message: 'You have used your 1 free PDF scan trial. Upgrade to Silver or Gold to scan more documents.'
        }, { status: 403 });
      }
    } else {
      const { data: tier } = await supabase
        .from('membership_tiers')
        .select('monthly_doc_limit')
        .eq('tier_name', user.tier)
        .single();

      if (tier && user.monthly_pdf_scans_used >= tier.monthly_doc_limit) {
        return NextResponse.json({
          error: 'Monthly limit reached',
          message: 'You have reached your monthly PDF scan limit. Your limit resets on the 1st of next month.'
        }, { status: 403 });
      }
    }

    const { data: doc, error: docError } = await supabase
      .from('case_documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', userId)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (!doc.file_url) {
      return NextResponse.json({ error: 'Document has no file attached. Please re-upload the file and try again.' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
    }

    const fileResponse = await fetch(doc.file_url);
    if (!fileResponse.ok) {
      return NextResponse.json({ error: 'Could not fetch document. The file may have expired — try re-uploading it.' }, { status: 500 });
    }

    const fileBuffer = await fileResponse.arrayBuffer();
    const base64File = Buffer.from(fileBuffer).toString('base64');

    // GPT-4o vision only accepts image MIME types
    // Files uploaded from mobile camera are images even if stored as application/pdf
    const rawMime = doc.file_type || '';
    const mimeType = rawMime.startsWith('image/') ? rawMime : 'image/jpeg';

    // Send everything as a vision request
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 2000,
        messages: [
          { role: 'system', content: activePrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: `Please analyze this legal document: ${doc.file_name}` },
              { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64File}`, detail: 'high' } }
            ]
          }
        ]
      })
    });

    if (!aiResponse.ok) {
      const err = await aiResponse.json();
      console.error('OpenAI error:', JSON.stringify(err));
      return NextResponse.json({ error: err?.error?.message || 'AI request failed' }, { status: 500 });
    }

    const aiData = await aiResponse.json();
    const analysis = aiData.choices?.[0]?.message?.content || '';

    await supabase
      .from('case_documents')
      .update({ ai_summary: analysis, ai_scanned: true })
      .eq('id', documentId);

    if (user.tier === 'bronze') {
      await supabase.from('users').update({ pdf_trial_used: user.pdf_trial_used + 1 }).eq('id', userId);
    } else {
      await supabase.from('users').update({ monthly_pdf_scans_used: user.monthly_pdf_scans_used + 1 }).eq('id', userId);
    }

    return NextResponse.json({ success: true, analysis, documentId });

  } catch (error) {
    console.error('Scan Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process scan' }, { status: 500 });
  }
}
