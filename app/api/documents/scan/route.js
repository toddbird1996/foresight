import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SCAN_PROMPT = `You are a legal document analyst helping a parent navigate a custody or family law case.

Read the ENTIRE document carefully before writing anything. Then follow this exact structure:

**DOCUMENT CONTENTS**
Quote or closely mirror the actual language of the document, section by section. Use the exact names, dates, dollar amounts, order numbers, and legal terms as they appear in the document. Do not paraphrase — write it as if you are transcribing the key content of each clause or paragraph. If the document has numbered paragraphs or sections, follow that same numbering structure. The goal is that someone who has not seen the document can read this section and know exactly what it says.

**WHAT THIS MEANS FOR YOU**
Translate each clause into plain everyday language. Explain what each order actually requires the parent to do or not do. What rights does it give or take away? What are the consequences of not following it?

**KEY DATES & DEADLINES**
List every specific date, deadline, timeline, or time-sensitive requirement from the document. Include the context for each one — what must happen by that date.

**RED FLAGS**
Identify anything urgent, potentially harmful to the parent's position, or requiring immediate action. Quote the specific language that raises the concern.

**RECOMMENDED NEXT STEPS**
Give 3-5 concrete, specific actions the parent should take — not generic advice. Reference the actual content of the document in your recommendations.

Be thorough. Do not skip or summarize sections. Never predict court outcomes. Always recommend consulting a lawyer for situation-specific advice.`;

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
        return NextResponse.json({ error: 'Monthly limit reached', message: 'You have reached your monthly PDF scan limit.' }, { status: 403 });
      }
    }

    const { data: doc, error: docError } = await supabase
      .from('case_documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', userId)
      .single();

    if (docError || !doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    if (!doc.file_url) return NextResponse.json({ error: 'No file attached. Please re-upload and try again.' }, { status: 400 });

    const apiKey = process.env.OPENAI_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });

    const fileResponse = await fetch(doc.file_url);
    if (!fileResponse.ok) return NextResponse.json({ error: 'Could not fetch document file.' }, { status: 500 });

    const fileBuffer = await fileResponse.arrayBuffer();
    const base64File = Buffer.from(fileBuffer).toString('base64');
    const mimeType = doc.file_type || 'application/pdf';
    const isImage = mimeType.startsWith('image/');

    let aiResponse;

    if (isImage) {
      // Images — use chat completions with vision
      aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o',
          max_tokens: 3000,
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
    } else {
      // PDFs — use OpenAI Responses API which natively supports PDF input
      aiResponse = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o',
          input: [
            {
              role: 'user',
              content: [
                {
                  type: 'input_file',
                  filename: doc.file_name || 'document.pdf',
                  file_data: `data:application/pdf;base64,${base64File}`
                },
                {
                  type: 'input_text',
                  text: `${activePrompt}\n\nPlease analyze this legal document: ${doc.file_name}`
                }
              ]
            }
          ]
        })
      });
    }

    if (!aiResponse.ok) {
      const err = await aiResponse.json();
      console.error('OpenAI error:', JSON.stringify(err));
      return NextResponse.json({ error: err?.error?.message || 'AI request failed' }, { status: 500 });
    }

    const aiData = await aiResponse.json();

    // Responses API and Chat Completions API have different response shapes
    const analysis = aiData.output_text
      || aiData.output?.[0]?.content?.[0]?.text
      || aiData.choices?.[0]?.message?.content
      || '';

    await supabase.from('case_documents').update({ ai_summary: analysis, ai_scanned: true }).eq('id', documentId);

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
