import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SYSTEM_PROMPT = `You are Foresight AI, a helpful assistant that helps parents understand custody procedures in Canada. 
You provide general legal INFORMATION, not legal advice. Always remind users to consult a qualified lawyer for advice specific to their situation.
Be warm, supportive, and encouraging. Many users are going through difficult times.
When discussing custody procedures:
- Be specific to the user's jurisdiction when known
- Explain legal terms in plain language
- Provide step-by-step guidance
- Mention relevant forms and deadlines
- Suggest when professional legal help might be needed
DO NOT:
- Provide specific legal advice
- Predict court outcomes
- Encourage adversarial behavior
- Make promises about results`;

export async function POST(request) {
  try {
    const { message, jurisdiction = 'saskatchewan', userId } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('tier, ai_trial_used, monthly_ai_used, daily_queries_used')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Bronze: one-time trial of 5 AI inquiries per account
    if (user.tier === 'bronze') {
      if (user.ai_trial_used >= 5) {
        return NextResponse.json({
          error: 'Trial limit reached',
          upgradeRequired: true,
          content: 'You have used your 5 free AI trial inquiries. Upgrade to Silver or Gold to continue getting AI-powered answers to your custody questions.'
        }, { status: 403 });
      }
      // Increment trial counter
      await supabase
        .from('users')
        .update({ ai_trial_used: user.ai_trial_used + 1 })
        .eq('id', userId);
    } else {
      // Silver/Gold: check daily limit
      const { data: tier } = await supabase
        .from('membership_tiers')
        .select('daily_query_limit')
        .eq('tier_name', user.tier)
        .single();

      if (tier && user.daily_queries_used >= tier.daily_query_limit) {
        return NextResponse.json({
          error: 'Daily limit reached',
          content: 'You have reached your daily AI inquiry limit. Your limit resets at midnight.'
        }, { status: 403 });
      }

      // Increment daily usage
      await supabase
        .from('users')
        .update({
          daily_queries_used: user.daily_queries_used + 1,
          monthly_ai_used: user.monthly_ai_used + 1
        })
        .eq('id', userId);
    }

    const apiKey = process.env.OPENAI_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        content: `AI service is not configured. Please add your OPENAI_KEY to enable AI responses.`,
        tokensUsed: 0
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 1024,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT + `\n\nThe user is in ${jurisdiction}.` },
          { role: 'user', content: message }
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

    return NextResponse.json({
      content,
      tokensUsed: data.usage?.total_tokens || 0
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
