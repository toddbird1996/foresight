// Foresight AI route — v2 with corrected OPENAI_KEY env var name
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function buildSystemPrompt(profile, caseData, upcomingDeadlines) {
  let prompt = `You are Foresight AI, a knowledgeable assistant helping Canadian parents navigate family law and custody matters. You provide general legal INFORMATION, not legal advice. Always remind users to consult a qualified lawyer for advice specific to their situation.

Your communication style:
- Warm, direct, and encouraging — many users are scared and overwhelmed
- Use plain language. Translate legal terms immediately
- Be specific and practical. Vague answers are not helpful
- When relevant, reference Saskatchewan-specific forms, procedures, and services by name
- Structure longer answers with clear steps or bullet points
- Always end with a practical next step the user can take today

What you must NEVER do:
- Predict court outcomes or guarantee results
- Provide specific legal advice about their particular case
- Encourage adversarial or hostile behavior toward the other parent
- Dismiss the user's concerns or minimize their situation`;

  // Add user context if available
  if (profile) {
    prompt += `

--- USER CONTEXT ---`;
    if (profile.jurisdiction) prompt += `
Jurisdiction: ${profile.jurisdiction.replace(/_/g, ' ')} — always reference Saskatchewan-specific law, forms, and services`;
    if (profile.case_status) prompt += `
Case status: ${profile.case_status.replace(/_/g, ' ')}`;
    if (profile.case_type) prompt += `
Case type: ${profile.case_type}`;
    if (profile.custody_situation) prompt += `
Custody situation: ${profile.custody_situation.replace(/_/g, ' ')}`;
    if (profile.legal_support) prompt += `
Legal support: ${profile.legal_support.replace(/_/g, ' ')}`;
    if (profile.num_children) prompt += `
Number of children: ${profile.num_children}`;
    prompt += `
Tailor every answer to this user's specific situation above. Do not give generic answers when context is available.`;
  }

  // Add active case context if available
  if (caseData) {
    prompt += `

--- ACTIVE CASE ---`;
    if (caseData.name) prompt += `
Case name: ${caseData.name}`;
    if (caseData.court_file_number) prompt += `
Court file number: ${caseData.court_file_number}`;
    if (caseData.opposing_party_name) prompt += `
Opposing party: ${caseData.opposing_party_name}`;
    if (caseData.jurisdiction_id) prompt += `
Case jurisdiction: ${caseData.jurisdiction_id}`;
    if (caseData.case_type) prompt += `
Case type: ${caseData.case_type}`;
    prompt += `
When the user refers to "my case", "the other parent", or "my file" — they mean the case above.`;
  }

  // Add upcoming deadlines
  if (upcomingDeadlines && upcomingDeadlines.length > 0) {
    prompt += `

--- UPCOMING DEADLINES ---`;
    upcomingDeadlines.slice(0, 5).forEach(d => {
      prompt += `
- ${d.title}: due ${d.due_date}${d.event_type ? ' (' + d.event_type + ')' : ''}`;
    });
    prompt += `
If the user asks about preparation, deadlines, or what to do next — factor in these upcoming dates.`;
  }

  return prompt;
}

export async function POST(request) {
  try {
    const { message, jurisdiction = 'saskatchewan', userId, history = [], imageBase64, imageMimeType } = await request.json();

    if (!message) return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    // Fetch user profile + limits in one query
    const { data: user, error } = await supabase
      .from('users')
      .select('tier, ai_trial_used, monthly_ai_used, daily_queries_used, case_status, case_type, custody_situation, legal_support, num_children, jurisdiction')
      .eq('id', userId)
      .single();

    if (error || !user) return NextResponse.json({ error: 'User not found' }, { status: 401 });

    // Check tier limits
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

    // Fetch active case context
    const { data: cases } = await supabase
      .from('cases')
      .select('name, court_file_number, opposing_party_name, jurisdiction_id, case_type, status')
      .eq('user_id', userId)
      .eq('is_active', true)
      .limit(1);
    const activeCase = cases?.[0] || null;

    // Fetch upcoming deadlines (next 30 days)
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
        model: imageBase64 ? 'gpt-4o' : 'gpt-4o-mini',
        max_tokens: 1024,
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
      return NextResponse.json({ error: 'AI request failed' }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({ content, tokensUsed: data.usage?.total_tokens || 0 });

  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
