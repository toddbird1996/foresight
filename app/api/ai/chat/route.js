// Foresight AI route — v3 parents global, Claude-style prompt
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function buildSystemPrompt(profile, caseData, upcomingDeadlines) {
  let prompt = `You are Foresight AI, a knowledgeable assistant helping parents navigate family law and custody matters. You provide general legal INFORMATION, not legal advice. Always remind users to consult a qualified lawyer for advice specific to their situation.

Your personality and approach:
- You are calm, warm, and steady — users are often scared, exhausted, and overwhelmed. Your tone should make them feel heard and capable
- You think before you answer. Work through the problem carefully, then give a clear, confident response
- Be honest even when the answer is hard to hear. Don't sugarcoat, but don't be harsh either
- You genuinely care about the outcome for this person and their children — let that show
- You are curious and thorough. If a question has layers, peel them back one at a time
- Never be dismissive. Every question deserves a real answer

Your communication style:
- Write like a knowledgeable friend, not a legal textbook
- Use plain language. When you must use a legal term, immediately explain it in plain English
- Be specific and practical — vague answers waste people's time
- Structure longer answers with clear steps or sections so they're easy to follow
- When referencing forms, deadlines, or procedures, be precise — name the form, the deadline, the exact step
- Always end with a concrete next step the user can take today or this week
- Match your response length to the complexity of the question — don't pad short answers, don't truncate complex ones

How you reason through problems:
- Read the question carefully. Identify what they're really asking, not just what they literally typed
- Consider their context (jurisdiction, case type, custody situation) before answering
- If there are multiple paths or outcomes, walk through each one clearly
- Flag anything time-sensitive or high-stakes prominently
- If you're uncertain about something jurisdiction-specific, say so and tell them where to verify

When summarizing or scanning documents (PDFs, court orders, legal filings):
- Summarize using the document's own language and exact wording as closely as possible — preserve names, dates, amounts, and legal terms exactly as written
- Do not paraphrase or reinterpret the document's meaning — reflect what it actually says
- After the literal summary, add a plain-language section explaining what it means for the user and what they should do about it
- Flag any deadlines, obligations, or rights mentioned in the document explicitly

What you must NEVER do:
- Predict court outcomes or guarantee results
- Give specific legal advice about their particular case
- Encourage hostile or adversarial behavior toward the other parent
- Dismiss or minimize the user's concerns
- Make up jurisdiction-specific rules you're not sure about — flag uncertainty instead`;

  if (profile) {
    prompt += `\n\n--- USER CONTEXT ---`;
    if (profile.jurisdiction) prompt += `\nJurisdiction: ${profile.jurisdiction.replace(/_/g, ' ')} — reference jurisdiction-specific law, forms, and services`;
    if (profile.case_status) prompt += `\nCase status: ${profile.case_status.replace(/_/g, ' ')}`;
    if (profile.case_type) prompt += `\nCase type: ${profile.case_type}`;
    if (profile.custody_situation) prompt += `\nCustody situation: ${profile.custody_situation.replace(/_/g, ' ')}`;
    if (profile.legal_support) prompt += `\nLegal support: ${profile.legal_support.replace(/_/g, ' ')}`;
    if (profile.num_children) prompt += `\nNumber of children: ${profile.num_children}`;
    prompt += `\nTailor every answer to this user's specific situation. Do not give generic answers when context is available.`;
  }

  if (caseData) {
    prompt += `\n\n--- ACTIVE CASE ---`;
    if (caseData.name) prompt += `\nCase name: ${caseData.name}`;
    if (caseData.court_file_number) prompt += `\nCourt file number: ${caseData.court_file_number}`;
    if (caseData.opposing_party_name) prompt += `\nOpposing party: ${caseData.opposing_party_name}`;
    if (caseData.jurisdiction_id) prompt += `\nCase jurisdiction: ${caseData.jurisdiction_id}`;
    if (caseData.case_type) prompt += `\nCase type: ${caseData.case_type}`;
    prompt += `\nWhen the user refers to "my case", "the other parent", or "my file" — they mean the case above.`;
  }

  if (upcomingDeadlines && upcomingDeadlines.length > 0) {
    prompt += `\n\n--- UPCOMING DEADLINES ---`;
    upcomingDeadlines.slice(0, 5).forEach(d => {
      prompt += `\n- ${d.title}: due ${d.due_date}${d.event_type ? ' (' + d.event_type + ')' : ''}`;
    });
    prompt += `\nIf the user asks about preparation, deadlines, or what to do next — factor in these upcoming dates.`;
  }

  return prompt;
}

export async function POST(request) {
  try {
    const { message, jurisdiction = 'saskatchewan', userId, history = [], imageBase64, imageMimeType, action } = await request.json();

    if (!message) return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { data: user, error } = await supabase
      .from('users')
      .select('tier, ai_trial_used, monthly_ai_used, daily_queries_used, case_status, case_type, custody_situation, legal_support, num_children, jurisdiction')
      .eq('id', userId)
      .single();

    if (error || !user) return NextResponse.json({ error: 'User not found' }, { status: 401 });

    if (user.tier === 'bronze') {
      if (user.ai_trial_used >= 5) {
        return NextResponse.json({
          error: 'Trial limit reached',
          upgradeRequired: true,
          content: 'You have used your 5 free AI trial inquiries. Upgrade to Silver or Gold to continue.'
        }, { status: 403 });
      }
      await supabase.from('users').update({ ai_trial_used: user.ai_trial_used + 1 }).eq('id', userId);
    } else {
      const { data: tier } = await supabase.from('membership_tiers').select('daily_query_limit').eq('tier_name', user.tier).single();
      if (tier && user.daily_queries_used >= tier.daily_query_limit) {
        return NextResponse.json({ error: 'Daily limit reached', content: 'You have reached your daily AI inquiry limit. Your limit resets at midnight.' }, { status: 403 });
      }
      await supabase.from('users').update({ daily_queries_used: user.daily_queries_used + 1, monthly_ai_used: user.monthly_ai_used + 1 }).eq('id', userId);
    }

    const { data: cases } = await supabase
      .from('cases')
      .select('name, court_file_number, opposing_party_name, jurisdiction_id, case_type, status')
      .eq('user_id', userId)
      .eq('is_active', true)
      .limit(1);
    const activeCase = cases?.[0] || null;

    const today = new Date().toISOString().split('T')[0];
    const future = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    const { data: deadlines } = await supabase
      .from('deadlines')
      .select('title, due_date, event_type, priority')
      .eq('user_id', userId)
      .eq('completed', false)
      .gte('due_date', today)
      .lte('due_date', future)
      .order('due_date', { ascending: true })
      .limit(5);

    const systemPrompt = buildSystemPrompt(user, activeCase, deadlines);

    const apiKey = process.env.OPENAI_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        content: 'AI service is not yet configured. Add your OPENAI_KEY environment variable to enable AI responses.',
        tokensUsed: 0
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: (imageBase64 || ['summarize','scan','compare'].includes(action)) ? 'gpt-4o' : 'gpt-4o-mini',
        max_tokens: 1500,
        messages: [
          { role: 'system', content: systemPrompt },
          ...history.slice(-8).map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: imageBase64
            ? [
                { type: 'text', text: message },
                { type: 'image_url', image_url: { url: `data:${imageMimeType || 'image/jpeg'};base64,${imageBase64}`, detail: 'high' } }
              ]
            : message
          }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('OpenAI Error:', err);
      const code = err?.error?.code || err?.error?.type || '';
      const userMsg = code === 'insufficient_quota'
        ? 'AI service is temporarily unavailable — billing limit reached. Please contact support.'
        : code === 'invalid_api_key'
        ? 'AI service configuration error — invalid API key.'
        : 'AI request failed. Please try again shortly.';
      return NextResponse.json({ error: userMsg, content: userMsg }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({ content, tokensUsed: data.usage?.total_tokens || 0 });

  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
