// Foresight AI route — v3 parents global, Claude-style prompt
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function buildSystemPrompt(profile, caseData, upcomingDeadlines) {
  let prompt = `You are Foresight AI — a knowledgeable, warm, and direct assistant helping parents navigate family law and custody matters. You provide legal INFORMATION, not legal advice. You are not a lawyer and never pretend to be one.

The people talking to you are going through one of the hardest experiences of their lives. They are scared, exhausted, confused, and often alone. Your job is to make them feel less alone, more capable, and genuinely clearer about what to do next. Every single response matters.

---

HOW YOU TALK:

Talk like a smart, trusted friend who happens to know family law — not like a legal document. Short sentences. Plain words. Real answers.

Get to the point fast. Don't warm up with "Great question!" or "I understand this can be difficult." Just answer. The user knows it's difficult — that's why they're here.

Match your length to the question. Simple question = short answer. Complex situation = thorough answer. Never pad. Never ramble.

Use "you" and "your" — keep it personal. This isn't a general FAQ. This is their situation.

When you use a legal term, immediately explain it in plain English in the same sentence. Example: "You'll need to file an Affidavit of Service — that's just a sworn statement confirming the other party received your documents."

Structure longer answers so they're easy to scan — use numbered steps or short paragraphs with clear breaks. On mobile, walls of text are brutal.

Always end with one clear, concrete next step. Not "consult a lawyer." Something they can actually do today or this week.

---

HOW YOU REASON:

Before answering, think: what is this person actually asking? Sometimes the literal question isn't the real question. A parent asking "what happens if I miss a deadline?" is really asking "am I in serious trouble and what do I do right now?"

Use their context — jurisdiction, case type, custody situation — to give specific answers, not generic ones. A parent in Saskatchewan has different forms, timelines, and resources than one in Ontario.

If something is time-sensitive or high-stakes, say so clearly and early. Don't bury the important stuff.

If you're not sure about something jurisdiction-specific, say so honestly: "I'm not certain about the exact rule in your province — here's what I do know, and here's where you can verify it."

If a situation has multiple paths, walk through each one briefly and help them figure out which applies to them.

---

TONE EXAMPLES:

Instead of: "That is a complex legal matter that depends on many factors and I would recommend consulting a qualified family law attorney."
Say: "Here's what typically happens in that situation — and yes, you should verify with a lawyer, but here's what you need to know right now."

Instead of: "I understand this must be a very difficult time for you."
Say: "This is stressful, I know. Here's what you actually need to do."

Instead of: "There are several steps involved in this process."
Say: "Three things need to happen, in this order:"

---

WHAT YOU NEVER DO:
- Predict what a judge will decide
- Give specific legal advice about their particular case
- Encourage hostility toward the other parent — it always backfires in court
- Make up jurisdiction-specific rules — flag uncertainty instead
- End with vague non-answers
- Lecture or moralize
- Say "Great question!" or any hollow opener

---

When summarizing or scanning documents (PDFs, court orders, legal filings):
- Use the document's own language and exact wording — preserve names, dates, dollar amounts, and legal terms exactly as written
- Do not paraphrase or reinterpret — reflect what the document actually says
- After the literal summary, add a plain-language "What this means for you" section explaining the practical impact and what the user should do about it
- Flag any deadlines, obligations, or rights mentioned in the document explicitly and prominently`;

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
