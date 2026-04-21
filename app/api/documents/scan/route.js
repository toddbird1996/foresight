import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import pdfParse from 'pdf-parse';

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
    const { documentId, userId } = await request.json();

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
      return NextResponse.json({ error: 'Document has no file URL' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
    }

    const fileResponse = await fetch(doc.file_url);
    if (!fileResponse.ok) {
      return NextResponse.json({ error: 'Could not fetch document file' }, { status: 500 });
    }

    const fileBuffer = await fileResponse.arrayBuffer();
    const mimeType = doc.file_type || '';
    const isImage = mimeType.startsWith('image/') || doc.file_name?.match(/\.(jpg|jpeg|png|webp|heic)$/i);
    const isPdf = mimeType.includes('pdf') || doc.file_name?.endsWith('.pdf');

    let messages;

    if (isImage) {
      // Images — use vision
      const base64File = Buffer.from(fileBuffer).toString('base64');
      messages = [
        { role: 'system', content: SCAN_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64File}`, detail: 'high' } },
            { type: 'text', text: `Please analyze this legal document: ${doc.file_name}` }
          ]
        }
      ];
    } else if (isPdf) {
      // PDFs — extract real text with pdf-parse
      let extractedText = '';
      try {
        const parsed = await pdfParse(Buffer.from(fileBuffer));
        extractedText = parsed.text?.substring(0, 15000) || '';
      } catch (parseErr) {
        console.error('PDF parse error:', parseErr);
      }

      if (!extractedText || extractedText.trim().length < 50) {
        return NextResponse.json({
          error: 'Could not extract text from this PDF. It may be scanned or image-based. Try re-uploading as an image (JPG/PNG) for better results.',
          analysis: 'This PDF appears to be scanned or image-based and could not be read as text. Please re-upload it as a JPG or PNG image for AI analysis.'
        });
      }

      messages = [
        { role: 'system', content: SCAN_PROMPT },
        {
          role: 'user',
          content: `Please analyze this legal document: ${doc.file_name}\n\nDocument text:\n${extractedText}`
        }
      ];
    } else {
      // Other text-based docs
      const textContent = Buffer.from(fileBuffer).toString('utf-8').substring(0, 15000);
      messages = [
        { role: 'system', content: SCAN_PROMPT },
        {
          role: 'user',
          content: `Please analyze this legal document: ${doc.file_name}\n\nDocument content:\n${textContent}`
        }
      ];
    }

    await supabase.from('case_documents').update({ status: 'processing' }).eq('id', documentId);

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 2000,
        messages
      })
    });

    if (!aiResponse.ok) {
      const err = await aiResponse.json();
      console.error('OpenAI Scan Error:', JSON.stringify(err));
      await supabase.from('case_documents').update({ status: 'failed' }).eq('id', documentId);
      return NextResponse.json({ error: 'AI scan failed', detail: err?.error?.message || '' }, { status: 500 });
    }

    const aiData = await aiResponse.json();
    const analysis = aiData.choices?.[0]?.message?.content || '';

    await supabase.from('case_documents').update({ status: 'analyzed', ai_summary: analysis, ai_scanned: true }).eq('id', documentId);

    if (user.tier === 'bronze') {
      await supabase.from('users').update({ pdf_trial_used: user.pdf_trial_used + 1 }).eq('id', userId);
    } else {
      await supabase.from('users').update({ monthly_pdf_scans_used: user.monthly_pdf_scans_used + 1 }).eq('id', userId);
    }

    return NextResponse.json({ success: true, analysis, documentId });

  } catch (error) {
    console.error('PDF Scan Error:', error);
    return NextResponse.json({ error: 'Failed to process scan', detail: error.message }, { status: 500 });
  }
}
