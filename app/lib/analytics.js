'use client';
import { supabase } from '../../lib/supabaseClient';

// Fire and forget — never blocks the user
export async function track(event, properties = {}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('users')
      .select('tier')
      .eq('id', user.id)
      .single();

    await supabase.from('analytics_events').insert({
      user_id: user.id,
      event,
      properties,
      tier: profile?.tier || 'bronze',
    });
  } catch {
    // Silent fail — never interrupt the user
  }
}

// Pre-built event names for consistency
export const EVENTS = {
  // Pages
  PAGE_DASHBOARD: 'page_dashboard',
  PAGE_AI: 'page_ai',
  PAGE_CASES: 'page_cases',
  PAGE_FILING: 'page_filing',
  PAGE_PROGRAMS: 'page_programs',
  PAGE_PRICING: 'page_pricing',
  PAGE_COMMUNITY: 'page_community',

  // AI
  AI_MESSAGE_SENT: 'ai_message_sent',
  AI_LIMIT_HIT: 'ai_limit_hit',

  // Documents
  DOC_UPLOAD_STARTED: 'doc_upload_started',
  DOC_UPLOAD_SUCCESS: 'doc_upload_success',
  DOC_SCAN_STARTED: 'doc_scan_started',
  DOC_SCAN_SUCCESS: 'doc_scan_success',
  DOC_SCAN_FAILED: 'doc_scan_failed',

  // Cases
  CASE_CREATED: 'case_created',
  CASE_OPENED: 'case_opened',

  // Deadlines
  DEADLINE_CREATED: 'deadline_created',

  // Action plan
  PLAN_STEP_OPENED: 'plan_step_opened',

  // Upgrade
  UPGRADE_BANNER_SEEN: 'upgrade_banner_seen',
  UPGRADE_CLICKED: 'upgrade_clicked',
  CHECKOUT_STARTED: 'checkout_started',
  CHECKOUT_REDIRECTED: 'checkout_redirected',
  CHECKOUT_FAILED: 'checkout_failed',
  UPGRADE_COMPLETED: 'upgrade_completed',

  // Support
  SUPPORT_TICKET_OPENED: 'support_ticket_opened',
  SUPPORT_TICKET_SUBMITTED: 'support_ticket_submitted',

  // Filing guide
  FILING_GUIDE_OPENED: 'filing_guide_opened',
  FILING_STEP_COMPLETED: 'filing_step_completed',

  // Case guide
  CASE_GUIDE_STEP_ADVANCED: 'case_guide_step_advanced',
};
