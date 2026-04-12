import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SCAN_PROMPT = `You are a legal document analyst helping a parent navigate a custody case in Canada.
Analyze this document and provide:
1. A plain-language summary (2-3 sentences)
2. Key dates mentioned
3. Key obligations or requirements for each party
4. Any deadlines or court dates
5. Red flags or items requiring urgent attention
6. Recommended next steps for the user

Be specific, practical, and supportive. Use plain language. Format your response with clear headings.
Do not provide legal advice — provide legal information and suggest consulting a lawyer for advice.`;

export async function POST(request) {
  try {
    const { documentId, userId } = await request.json();

    if (!documentId || !userId) {
      return NextResponse.json({ error: 'documentId and userId are required' }, { status: 400 });
    }

    // Get user tier and trial usage
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('tier, pdf_trial_used, monthly_pdf_scans_used')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Bronze: one-time trial of 1 PDF scan per account
    if (user.tier === 'bronze') {
      if (user.pdf_trial_used >= 1) {
        return NextResponse.json({
          error: 'Trial limit reached',
          upgradeRequired: true,
          message: 'You have used your 1 free PDF scan trial. Upgrade to Silver or Gold to scan more documents.'
        }, { status: 403 });
      }
    } else {
      // Silver/Gold: check monthly limit
      const { data: tier } = await supabase
        .from('membership_tiers')
        .select('monthly_doc_limit')
        .eq('tier_name', user.tier)
        .single();

      if (tier && user.monthly_pdf_scans_used >= tier.monthly_doc_limit) {
        return NextResponse.json({
          error: 'Monthly limit reached',
          message: `You have reached your monthly PDF scan limit. Your limit resets on the 1st of next month.`
        }, { status: 403 });
      }
    }

    // Get the document record
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

    // Fetch the file and convert to base64
    const fileResponse = await fetch(doc.file_url);
    if (!fileResponse.ok) {
      return NextResponse.json({ error: 'Could not fetch document file' }, { status: 500 });
    }

    const fileBuffer = await fileResponse.arrayBuffer();
    const base64File = Buffer.from(fileBuffer).toString('base64');
    const mimeType = doc.file_type || 'application/pdf';

    // Call OpenAI with vision for images or file content for PDFs
    let messages;
    if (mimeType.startsWith('image/')) {
      messages = [
        { role: 'system', content: SCAN_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64File}` } },
            { type: 'text', text: 'Please analyze this legal document.' }
          ]
        }
      ];
    } else {
      // For PDFs and Word docs, send as text prompt with base64
      messages = [
        { role: 'system', content: SCAN_PROMPT },
        {
          role: 'user',
          content: `Please analyze this legal document (${doc.file_name}). The document is encoded in base64 below:\n\n${base64File.substring(0, 8000)}`
        }
      ];
    }

    // Update status to processing
    await supabase
      .from('case_documents')
      .update({ status: 'processing' })
      .eq('id', documentId);

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 1500,
        messages
      })
    });

    if (!aiResponse.ok) {
      await supabase.from('case_documents').update({ status: 'failed' }).eq('id', documentId);
      return NextResponse.json({ error: 'AI scan failed' }, { status: 500 });
    }

    const aiData = await aiResponse.json();
    const analysis = aiData.choices?.[0]?.message?.content || '';

    // Save results to document record
    await supabase
      .from('case_documents')
      .update({
        status: 'analyzed',
        ai_summary: analysis,
        
        ai_scanned: true
      })
      .eq('id', documentId);

    // Increment usage counters
    if (user.tier === 'bronze') {
      await supabase
        .from('users')
        .update({ pdf_trial_used: user.pdf_trial_used + 1 })
        .eq('id', userId);
    } else {
      await supabase
        .from('users')
        .update({ monthly_pdf_scans_used: user.monthly_pdf_scans_used + 1 })
        .eq('id', userId);
    }

    return NextResponse.json({
      success: true,
      analysis,
      documentId
    });

  } catch (error) {
    console.error('PDF Scan Error:', error);
    return NextResponse.json({ error: 'Failed to process scan' }, { status: 500 });
  }
}
