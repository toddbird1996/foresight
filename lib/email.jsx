// ============================================
// FORESIGHT - EMAIL NOTIFICATION SYSTEM
// ============================================

// ============================================
// 1. EMAIL TEMPLATES
// ============================================

export const EMAIL_TEMPLATES = {
  // ============ WELCOME EMAIL ============
  welcome: {
    subject: 'Welcome to Foresight - Let\'s Get Started',
    html: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Foresight</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #f97316, #f59e0b); border-radius: 16px; display: inline-block; line-height: 60px; font-size: 30px;">
                👁️
              </div>
              <div style="color: #f97316; font-size: 24px; font-weight: bold; margin-top: 10px;">Foresight</div>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="background-color: #1a1a2e; border-radius: 16px; padding: 40px;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 20px 0; text-align: center;">
                Welcome, ${data.name}! 🎉
              </h1>
              
              <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                You've taken an important step. Navigating custody can feel overwhelming, but you're not alone anymore.
              </p>
              
              <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Foresight was built by someone who spent $30,000 on lawyers who failed, then figured out the system himself and won. Now we're here to help you do the same.
              </p>
              
              <!-- What's Next -->
              <div style="background-color: #0f0f1a; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
                <h2 style="color: #f97316; font-size: 18px; margin: 0 0 16px 0;">🚀 Get Started</h2>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #22c55e;">✓</span>
                      <span style="color: #e2e8f0; margin-left: 10px;">Complete your profile</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #22c55e;">✓</span>
                      <span style="color: #e2e8f0; margin-left: 10px;">Review your ${data.jurisdiction} filing guide</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #22c55e;">✓</span>
                      <span style="color: #e2e8f0; margin-left: 10px;">Ask the AI assistant your first question</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #22c55e;">✓</span>
                      <span style="color: #e2e8f0; margin-left: 10px;">Join the community</span>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${data.dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #f97316, #f59e0b); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                      Go to Dashboard →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">
                Questions? Reply to this email or visit our help center.
              </p>
              <p style="color: #475569; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Foresight. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  },

  // ============ DEADLINE REMINDER ============
  deadlineReminder: {
    subject: (data) => `⚠️ Reminder: ${data.title} due in ${data.daysUntil} day${data.daysUntil === 1 ? '' : 's'}`,
    html: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #f97316, #f59e0b); border-radius: 12px; display: inline-block; line-height: 50px; font-size: 24px;">
                👁️
              </div>
            </td>
          </tr>
          
          <!-- Alert Banner -->
          <tr>
            <td style="background-color: ${data.priority === 'high' ? '#7f1d1d' : '#78350f'}; border-radius: 12px 12px 0 0; padding: 20px; text-align: center;">
              <span style="font-size: 32px;">${data.priority === 'high' ? '🚨' : '⏰'}</span>
              <h2 style="color: #ffffff; font-size: 20px; margin: 10px 0 0 0;">
                ${data.daysUntil === 0 ? 'Due Today!' : data.daysUntil === 1 ? 'Due Tomorrow!' : `Due in ${data.daysUntil} Days`}
              </h2>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="background-color: #1a1a2e; border-radius: 0 0 12px 12px; padding: 30px;">
              <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 10px 0;">
                ${data.title}
              </h1>
              
              ${data.description ? `
              <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                ${data.description}
              </p>
              ` : ''}
              
              <!-- Deadline Details -->
              <div style="background-color: #0f0f1a; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0; color: #64748b;">📅 Due Date:</td>
                    <td style="padding: 8px 0; color: #ffffff; text-align: right; font-weight: 600;">
                      ${new Date(data.dueDate).toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b;">📋 Type:</td>
                    <td style="padding: 8px 0; color: #ffffff; text-align: right; text-transform: capitalize;">
                      ${data.type}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b;">⚡ Priority:</td>
                    <td style="padding: 8px 0; text-align: right;">
                      <span style="background-color: ${data.priority === 'high' ? '#dc2626' : data.priority === 'medium' ? '#f59e0b' : '#22c55e'}; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 12px; text-transform: uppercase;">
                        ${data.priority}
                      </span>
                    </td>
                  </tr>
                </table>
              </div>
              
              ${data.tips ? `
              <!-- Tips -->
              <div style="border-left: 3px solid #f97316; padding-left: 16px; margin-bottom: 24px;">
                <p style="color: #f97316; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">💡 Tips</p>
                <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0;">
                  ${data.tips}
                </p>
              </div>
              ` : ''}
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${data.calendarUrl}" style="display: inline-block; background: linear-gradient(135deg, #f97316, #f59e0b); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px;">
                      View in Calendar →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px; text-align: center;">
              <p style="color: #64748b; font-size: 13px; margin: 0 0 8px 0;">
                <a href="${data.settingsUrl}" style="color: #64748b;">Manage notification settings</a>
              </p>
              <p style="color: #475569; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Foresight
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  },

  // ============ WEEKLY DIGEST ============
  weeklyDigest: {
    subject: '📊 Your Weekly Foresight Update',
    html: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #f97316, #f59e0b); border-radius: 12px; display: inline-block; line-height: 50px; font-size: 24px;">
                👁️
              </div>
              <div style="color: #f97316; font-size: 20px; font-weight: bold; margin-top: 8px;">Foresight</div>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="background-color: #1a1a2e; border-radius: 16px; padding: 30px;">
              <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 8px 0;">
                Hi ${data.name} 👋
              </h1>
              <p style="color: #94a3b8; font-size: 16px; margin: 0 0 24px 0;">
                Here's your weekly progress update.
              </p>
              
              <!-- Stats Grid -->
              <table width="100%" cellpadding="0" cellspacing="8" style="margin-bottom: 24px;">
                <tr>
                  <td width="50%" style="background-color: #0f0f1a; border-radius: 12px; padding: 16px; text-align: center;">
                    <div style="font-size: 28px; font-weight: bold; color: #f97316;">${data.stepsCompleted}</div>
                    <div style="color: #64748b; font-size: 13px; margin-top: 4px;">Steps Completed</div>
                  </td>
                  <td width="50%" style="background-color: #0f0f1a; border-radius: 12px; padding: 16px; text-align: center;">
                    <div style="font-size: 28px; font-weight: bold; color: #22c55e;">${data.progressPercent}%</div>
                    <div style="color: #64748b; font-size: 13px; margin-top: 4px;">Overall Progress</div>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="background-color: #0f0f1a; border-radius: 12px; padding: 16px; text-align: center;">
                    <div style="font-size: 28px; font-weight: bold; color: #3b82f6;">${data.aiQueries}</div>
                    <div style="color: #64748b; font-size: 13px; margin-top: 4px;">AI Queries</div>
                  </td>
                  <td width="50%" style="background-color: #0f0f1a; border-radius: 12px; padding: 16px; text-align: center;">
                    <div style="font-size: 28px; font-weight: bold; color: #a855f7;">${data.communityPosts}</div>
                    <div style="color: #64748b; font-size: 13px; margin-top: 4px;">Community Posts</div>
                  </td>
                </tr>
              </table>
              
              ${data.upcomingDeadlines?.length > 0 ? `
              <!-- Upcoming Deadlines -->
              <div style="margin-bottom: 24px;">
                <h2 style="color: #ffffff; font-size: 18px; margin: 0 0 16px 0;">📅 Upcoming Deadlines</h2>
                ${data.upcomingDeadlines.map(d => `
                  <div style="background-color: ${d.priority === 'high' ? '#450a0a' : '#0f0f1a'}; border-radius: 8px; padding: 12px; margin-bottom: 8px; border-left: 3px solid ${d.priority === 'high' ? '#dc2626' : '#f59e0b'};">
                    <div style="color: #ffffff; font-weight: 500;">${d.title}</div>
                    <div style="color: #64748b; font-size: 13px; margin-top: 4px;">${d.dueDate}</div>
                  </div>
                `).join('')}
              </div>
              ` : ''}
              
              ${data.nextSteps?.length > 0 ? `
              <!-- Suggested Next Steps -->
              <div style="margin-bottom: 24px;">
                <h2 style="color: #ffffff; font-size: 18px; margin: 0 0 16px 0;">🎯 Suggested Next Steps</h2>
                ${data.nextSteps.map(step => `
                  <div style="background-color: #0f0f1a; border-radius: 8px; padding: 12px; margin-bottom: 8px;">
                    <div style="color: #ffffff;">${step}</div>
                  </div>
                `).join('')}
              </div>
              ` : ''}
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${data.dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #f97316, #f59e0b); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px;">
                      Continue Your Progress →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px; text-align: center;">
              <p style="color: #64748b; font-size: 13px; margin: 0 0 8px 0;">
                <a href="${data.unsubscribeUrl}" style="color: #64748b;">Unsubscribe from weekly digest</a>
              </p>
              <p style="color: #475569; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Foresight
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  },

  // ============ MENTOR MESSAGE ============
  mentorMessage: {
    subject: (data) => `💬 New message from ${data.mentorName}`,
    html: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          <!-- Main Content -->
          <tr>
            <td style="background-color: #1a1a2e; border-radius: 16px; padding: 30px;">
              <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <div style="width: 48px; height: 48px; background-color: #7c3aed; border-radius: 50%; display: inline-block; line-height: 48px; text-align: center; color: #ffffff; font-weight: bold; font-size: 20px;">
                  ${data.mentorName[0]}
                </div>
                <div style="margin-left: 12px;">
                  <div style="color: #ffffff; font-weight: 600;">${data.mentorName}</div>
                  <div style="color: #a855f7; font-size: 13px;">Mentor</div>
                </div>
              </div>
              
              <div style="background-color: #0f0f1a; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <p style="color: #e2e8f0; font-size: 15px; line-height: 1.6; margin: 0;">
                  ${data.messagePreview}
                </p>
              </div>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${data.conversationUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px;">
                      View Conversation →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px; text-align: center;">
              <p style="color: #475569; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Foresight
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  },

  // ============ SUBSCRIPTION CONFIRMATION ============
  subscriptionConfirmed: {
    subject: (data) => `🎉 Welcome to Foresight ${data.tierName}!`,
    html: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          <!-- Main Content -->
          <tr>
            <td style="background-color: #1a1a2e; border-radius: 16px; padding: 40px; text-align: center;">
              <div style="font-size: 64px; margin-bottom: 20px;">${data.tierIcon}</div>
              <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 10px 0;">
                You're now ${data.tierName}!
              </h1>
              <p style="color: #94a3b8; font-size: 16px; margin: 0 0 30px 0;">
                Thank you for upgrading. Here's what's unlocked:
              </p>
              
              <div style="background-color: #0f0f1a; border-radius: 12px; padding: 24px; text-align: left; margin-bottom: 30px;">
                ${data.features.map(f => `
                  <div style="padding: 8px 0; color: #e2e8f0;">
                    <span style="color: #22c55e; margin-right: 10px;">✓</span>
                    ${f}
                  </div>
                `).join('')}
              </div>
              
              <a href="${data.dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #f97316, #f59e0b); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                Start Using ${data.tierName} Features →
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px; text-align: center;">
              <p style="color: #64748b; font-size: 13px; margin: 0 0 8px 0;">
                <a href="${data.billingUrl}" style="color: #64748b;">Manage billing</a>
              </p>
              <p style="color: #475569; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Foresight
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  }
};

// ============================================
// 2. SUPABASE EDGE FUNCTION: Send Email
// File: supabase/functions/send-email/index.ts
// ============================================

export const sendEmailFunctionCode = `
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

interface EmailRequest {
  to: string;
  template: string;
  data: Record<string, any>;
}

serve(async (req) => {
  try {
    const { to, template, data } = await req.json() as EmailRequest;

    // Get template
    const emailTemplate = EMAIL_TEMPLATES[template];
    if (!emailTemplate) {
      return new Response(JSON.stringify({ error: 'Template not found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate email
    const subject = typeof emailTemplate.subject === 'function' 
      ? emailTemplate.subject(data) 
      : emailTemplate.subject;
    const html = emailTemplate.html(data);

    // Send via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${RESEND_API_KEY}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Foresight <notifications@foresight.app>',
        to: [to],
        subject,
        html
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to send email');
    }

    // Log email sent
    await supabase.from('email_log').insert({
      to_email: to,
      template,
      subject,
      status: 'sent',
      resend_id: result.id
    });

    return new Response(JSON.stringify({ success: true, id: result.id }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Send email error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
`;

// ============================================
// 3. SUPABASE EDGE FUNCTION: Deadline Reminders
// File: supabase/functions/deadline-reminders/index.ts
// ============================================

export const deadlineRemindersFunctionCode = `
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const APP_URL = Deno.env.get('APP_URL') || 'https://foresight.app';

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

// This function runs on a schedule (cron)
serve(async (req) => {
  try {
    const today = new Date();
    const reminderDays = [7, 3, 1, 0]; // Days before deadline to send reminders

    for (const days of reminderDays) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + days);
      const targetDateStr = targetDate.toISOString().split('T')[0];

      // Find deadlines due on target date
      const { data: deadlines, error } = await supabase
        .from('deadlines')
        .select(\`
          *,
          user:users(id, email, full_name)
        \`)
        .eq('due_date', targetDateStr)
        .eq('completed', false)
        .contains('reminder_days', [days]);

      if (error) {
        console.error('Error fetching deadlines:', error);
        continue;
      }

      // Send reminder for each deadline
      for (const deadline of deadlines || []) {
        // Check if reminder already sent
        const { data: existingReminder } = await supabase
          .from('email_log')
          .select('id')
          .eq('to_email', deadline.user.email)
          .eq('template', 'deadlineReminder')
          .eq('metadata->>deadline_id', deadline.id)
          .eq('metadata->>days_before', days)
          .single();

        if (existingReminder) {
          continue; // Already sent
        }

        // Send reminder email
        await supabase.functions.invoke('send-email', {
          body: {
            to: deadline.user.email,
            template: 'deadlineReminder',
            data: {
              name: deadline.user.full_name,
              title: deadline.title,
              description: deadline.description,
              dueDate: deadline.due_date,
              daysUntil: days,
              type: deadline.type,
              priority: deadline.priority,
              calendarUrl: \`\${APP_URL}/calendar\`,
              settingsUrl: \`\${APP_URL}/settings/notifications\`
            }
          }
        });

        // Log that reminder was sent
        await supabase.from('email_log').insert({
          to_email: deadline.user.email,
          template: 'deadlineReminder',
          subject: \`Reminder: \${deadline.title}\`,
          status: 'sent',
          metadata: {
            deadline_id: deadline.id,
            days_before: days
          }
        });

        // Also create in-app notification
        await supabase.from('notifications').insert({
          user_id: deadline.user.id,
          type: 'deadline',
          title: days === 0 
            ? \`⚠️ \${deadline.title} is due today!\`
            : \`📅 \${deadline.title} due in \${days} day\${days === 1 ? '' : 's'}\`,
          message: deadline.description,
          link_type: 'deadline',
          link_id: deadline.id
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Deadline reminders error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
`;

// ============================================
// 4. SUPABASE EDGE FUNCTION: Weekly Digest
// File: supabase/functions/weekly-digest/index.ts
// ============================================

export const weeklyDigestFunctionCode = `
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const APP_URL = Deno.env.get('APP_URL') || 'https://foresight.app';

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

serve(async (req) => {
  try {
    // Get users who want weekly digest
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email_digest_enabled', true);

    if (error) throw error;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    for (const user of users || []) {
      // Get user stats for the week
      const [progressResult, aiResult, postsResult, deadlinesResult] = await Promise.all([
        // Steps completed this week
        supabase
          .from('user_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('completed', true)
          .gte('completed_at', oneWeekAgo.toISOString()),
        
        // AI queries this week
        supabase
          .from('ai_messages')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'user')
          .in('conversation_id', 
            supabase.from('ai_conversations').select('id').eq('user_id', user.id)
          )
          .gte('created_at', oneWeekAgo.toISOString()),
        
        // Community posts this week
        supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', oneWeekAgo.toISOString()),
        
        // Upcoming deadlines
        supabase
          .from('deadlines')
          .select('*')
          .eq('user_id', user.id)
          .eq('completed', false)
          .gte('due_date', new Date().toISOString().split('T')[0])
          .order('due_date')
          .limit(5)
      ]);

      // Calculate overall progress
      const { count: totalSteps } = await supabase
        .from('filing_steps')
        .select('*', { count: 'exact', head: true })
        .eq('jurisdiction_id', user.jurisdiction);

      const { count: completedSteps } = await supabase
        .from('user_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('completed', true);

      const progressPercent = totalSteps > 0 
        ? Math.round((completedSteps / totalSteps) * 100) 
        : 0;

      // Get next suggested steps
      const { data: nextSteps } = await supabase
        .from('filing_steps')
        .select('title')
        .eq('jurisdiction_id', user.jurisdiction)
        .not('id', 'in', 
          supabase
            .from('user_progress')
            .select('step_id')
            .eq('user_id', user.id)
            .eq('completed', true)
        )
        .order('display_order')
        .limit(3);

      // Send digest email
      await supabase.functions.invoke('send-email', {
        body: {
          to: user.email,
          template: 'weeklyDigest',
          data: {
            name: user.full_name,
            stepsCompleted: progressResult.count || 0,
            progressPercent,
            aiQueries: aiResult.count || 0,
            communityPosts: postsResult.count || 0,
            upcomingDeadlines: (deadlinesResult.data || []).map(d => ({
              title: d.title,
              dueDate: new Date(d.due_date).toLocaleDateString(),
              priority: d.priority
            })),
            nextSteps: (nextSteps || []).map(s => s.title),
            dashboardUrl: \`\${APP_URL}/dashboard\`,
            unsubscribeUrl: \`\${APP_URL}/settings/notifications\`
          }
        }
      });
    }

    return new Response(JSON.stringify({ success: true, sent: users?.length || 0 }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Weekly digest error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
`;

// ============================================
// 5. DATABASE: Email Log Table
// ============================================

export const emailLogTableSQL = `
-- Email log table
CREATE TABLE email_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  to_email VARCHAR(255) NOT NULL,
  template VARCHAR(100) NOT NULL,
  subject VARCHAR(500),
  status VARCHAR(50) DEFAULT 'pending',
  resend_id VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_email_log_to ON email_log(to_email);
CREATE INDEX idx_email_log_template ON email_log(template);
CREATE INDEX idx_email_log_created ON email_log(created_at DESC);

-- User notification preferences
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_deadline_reminders BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_digest_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_mentor_messages BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_community_mentions BOOLEAN DEFAULT TRUE;
`;

// ============================================
// 6. CRON SETUP (via Supabase Dashboard)
// ============================================

export const cronSetup = `
# Supabase Cron Jobs Setup
# Configure these in Supabase Dashboard > Database > Extensions > pg_cron

# 1. Deadline Reminders - Run every day at 8 AM UTC
SELECT cron.schedule(
  'deadline-reminders-daily',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/deadline-reminders',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);

# 2. Weekly Digest - Run every Monday at 9 AM UTC
SELECT cron.schedule(
  'weekly-digest',
  '0 9 * * 1',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/weekly-digest',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);
`;

// ============================================
// 7. REACT: NOTIFICATION SETTINGS COMPONENT
// ============================================

import React, { useState, useEffect } from 'react';

export function NotificationSettings({ userId }) {
  const [settings, setSettings] = useState({
    email_deadline_reminders: true,
    email_digest_enabled: true,
    email_mentor_messages: true,
    email_community_mentions: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [userId]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('email_deadline_reminders, email_digest_enabled, email_mentor_messages, email_community_mentions')
        .eq('id', userId)
        .single();

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaving(true);

    try {
      await supabase
        .from('users')
        .update({ [key]: value })
        .eq('id', userId);
    } catch (error) {
      console.error('Failed to update setting:', error);
      // Revert on error
      setSettings(prev => ({ ...prev, [key]: !value }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-64 bg-slate-800 rounded-xl" />;
  }

  const settingsConfig = [
    {
      key: 'email_deadline_reminders',
      title: 'Deadline Reminders',
      description: 'Get email reminders 7 days, 3 days, and 1 day before deadlines',
      icon: '📅'
    },
    {
      key: 'email_digest_enabled',
      title: 'Weekly Digest',
      description: 'Receive a weekly summary of your progress every Monday',
      icon: '📊'
    },
    {
      key: 'email_mentor_messages',
      title: 'Mentor Messages',
      description: 'Get notified when a mentor sends you a message',
      icon: '💬'
    },
    {
      key: 'email_community_mentions',
      title: 'Community Mentions',
      description: 'Get notified when someone mentions you in the community',
      icon: '👋'
    }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <span>📧</span>
        Email Notifications
      </h2>

      <div className="space-y-4">
        {settingsConfig.map(({ key, title, description, icon }) => (
          <div
            key={key}
            className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{icon}</span>
              <div>
                <div className="font-medium">{title}</div>
                <div className="text-sm text-slate-400">{description}</div>
              </div>
            </div>
            <button
              onClick={() => updateSetting(key, !settings[key])}
              disabled={saving}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings[key] ? 'bg-orange-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  settings[key] ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <p className="mt-6 text-sm text-slate-500">
        You can also unsubscribe from any email by clicking the link at the bottom of the email.
      </p>
    </div>
  );
}

// ============================================
// 8. CLIENT-SIDE EMAIL SERVICE
// ============================================

export const emailService = {
  /**
   * Send a transactional email
   */
  async send(to, template, data) {
    const { data: result, error } = await supabase.functions.invoke('send-email', {
      body: { to, template, data }
    });

    if (error) throw error;
    return result;
  },

  /**
   * Send welcome email
   */
  async sendWelcome(user) {
    return this.send(user.email, 'welcome', {
      name: user.full_name,
      jurisdiction: user.jurisdiction,
      dashboardUrl: `${window.location.origin}/dashboard`
    });
  },

  /**
   * Send subscription confirmation
   */
  async sendSubscriptionConfirmed(user, tier) {
    const tierConfig = {
      silver: {
        name: 'Silver',
        icon: '🥈',
        features: [
          '25 AI queries per day',
          '5 document analyses per month',
          '3 jurisdictions',
          'Limited mentor access',
          'Priority email support'
        ]
      },
      gold: {
        name: 'Gold',
        icon: '🥇',
        features: [
          '50 AI queries per day',
          '10 document analyses per month',
          'All jurisdictions',
          'Unlimited mentor access',
          'Priority support',
          'Early access to new features'
        ]
      }
    };

    const config = tierConfig[tier];
    if (!config) return;

    return this.send(user.email, 'subscriptionConfirmed', {
      tierName: config.name,
      tierIcon: config.icon,
      features: config.features,
      dashboardUrl: `${window.location.origin}/dashboard`,
      billingUrl: `${window.location.origin}/settings/billing`
    });
  },

  /**
   * Send mentor message notification
   */
  async sendMentorMessageNotification(user, mentor, messagePreview) {
    return this.send(user.email, 'mentorMessage', {
      mentorName: mentor.full_name,
      messagePreview: messagePreview.substring(0, 200) + (messagePreview.length > 200 ? '...' : ''),
      conversationUrl: `${window.location.origin}/mentors/chat/${mentor.id}`
    });
  }
};

// ============================================
// 9. SETUP GUIDE
// ============================================

export const EMAIL_SETUP_GUIDE = `
# Email Notification Setup Guide

## 1. Create Resend Account
- Go to https://resend.com
- Create account and verify domain
- Get API key

## 2. Add Environment Variables
In Supabase Dashboard > Settings > Edge Functions:

\`\`\`
RESEND_API_KEY=re_xxxxxxxxxxxx
APP_URL=https://your-domain.com
\`\`\`

## 3. Deploy Edge Functions

\`\`\`bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Deploy functions
supabase functions deploy send-email
supabase functions deploy deadline-reminders
supabase functions deploy weekly-digest
\`\`\`

## 4. Run Database Migrations
Execute the emailLogTableSQL in Supabase SQL Editor.

## 5. Set Up Cron Jobs
In Supabase Dashboard > Database > Extensions:
- Enable pg_cron and pg_net extensions
- Run the cron setup SQL

## 6. Configure DNS for Email
Add these DNS records for your domain:
- SPF record
- DKIM record (from Resend)
- DMARC record

## 7. Test Emails
\`\`\`javascript
import { emailService } from './email-notifications';

// Test welcome email
await emailService.sendWelcome({
  email: 'test@example.com',
  full_name: 'Test User',
  jurisdiction: 'Saskatchewan'
});
\`\`\`

## Email Templates Included
1. Welcome - New user signup
2. Deadline Reminder - 7/3/1/0 days before
3. Weekly Digest - Progress summary
4. Mentor Message - New DM notification
5. Subscription Confirmed - Upgrade confirmation
`;

// ============================================
// EXPORTS
// ============================================

export default {
  EMAIL_TEMPLATES,
  emailService,
  NotificationSettings,
  EMAIL_SETUP_GUIDE
};
