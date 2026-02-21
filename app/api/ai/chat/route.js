import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

    // Check if user is on a paid plan
    if (userId) {
      const { data: user, error } = await supabase
        .from('users')
        .select('tier')
        .eq('id', userId)
        .single();

      if (error || !user) {
        return NextResponse.json({ error: 'User not found' }, { status: 401 });
      }

      // Block free (bronze) users from AI
      if (user.tier === 'bronze') {
        return NextResponse.json({
          error: 'AI assistant is a premium feature',
          upgradeRequired: true,
          content: 'The AI assistant is available for Silver and Gold members. Upgrade your plan to get instant answers to your custody questions!'
        }, { status: 403 });
      }
    } else {
      // No user ID provided - require authentication
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        content: `AI service is not configured. Please add your ANTHROPIC_API_KEY to enable AI responses.`,
        tokensUsed: 0
      });
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT + `\n\nThe user is in ${jurisdiction}.`,
      messages: [
        { role: 'user', content: message }
      ]
    });

    const content = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';

    return NextResponse.json({
      content,
      tokensUsed: response.usage?.output_tokens || 0
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
