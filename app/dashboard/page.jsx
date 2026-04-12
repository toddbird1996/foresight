"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import OnboardingFlow from "../components/Onboarding";
import Header from "../components/Header";
import Footer from '../components/Footer';
import CaseGuide from '../components/CaseGuide';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [actionPlan, setActionPlan] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [checklist, setChecklist] = useState({});


  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push("/auth/login");
      } else {
        setUser(user);

        const { data: profile } = await supabase
          .from("users")
          .select("onboarding_completed, action_plan, full_name, case_status, case_type, jurisdiction, case_guide_step, guide_dismissed, ai_trial_used, tier")
          .eq("id", user.id)
          .single();

        if (profile && !profile.onboarding_completed) {
          setShowOnboarding(true);
        }
        if (profile?.action_plan) setActionPlan(profile.action_plan);
        if (profile) setUserProfile(profile);

        // Fetch document checklist progress
        const { data: checklistData } = await supabase
          .from('document_checklist')
          .select('item_key, checked')
          .eq('user_id', user.id);
        const checkMap = {};
        (checklistData || []).forEach(r => { checkMap[r.item_key] = r.checked; });
        setChecklist(checkMap);

        // Fetch upcoming deadlines (next 14 days, not completed)
        const today = new Date().toISOString().split('T')[0];
        const twoWeeks = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
        const { data: deadlines } = await supabase
          .from("deadlines")
          .select("*")
          .eq("user_id", user.id)
          .eq("completed", false)
          .gte("due_date", today)
          .lte("due_date", twoWeeks)
          .order("due_date", { ascending: true })
          .limit(5);
        setUpcomingDeadlines(deadlines || []);
      }
    });
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) alert("Logout error: " + error.message);
    else router.push("/auth/login");
  };


  if (!user) return null;

  if (showOnboarding) {
    return <OnboardingFlow user={user} onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* AI Question Bar */}
        <QuestionBar />

        {/* Smart Status Banner */}
        {userProfile && <SmartStatusBanner profile={userProfile} />}

        {/* Document Checklist */}
        {userProfile?.case_status && userProfile.case_status !== 'no_case' && (
          <DocChecklist
            profile={userProfile}
            checklist={checklist}
            userId={user?.id}
            onToggle={async (key, val) => {
              setChecklist(prev => ({ ...prev, [key]: val }));
              const { data: existing } = await supabase.from('document_checklist').select('id').eq('user_id', user.id).eq('item_key', key).single();
              if (existing) {
                await supabase.from('document_checklist').update({ checked: val, checked_at: val ? new Date().toISOString() : null }).eq('id', existing.id);
              } else {
                await supabase.from('document_checklist').insert({ user_id: user.id, item_key: key, checked: val, checked_at: val ? new Date().toISOString() : null });
              }
            }}
          />
        )}

        {/* Case Guide - Step by Step Walkthrough */}
        {user && <CaseGuide userId={user.id} currentStep={userProfile?.case_guide_step || 0} dismissed={userProfile?.guide_dismissed || false} caseStatus={userProfile?.case_status} />}

        {/* Welcome */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {userProfile?.full_name ? `Welcome back, ${userProfile.full_name.split(' ')[0]}!` : 'Welcome back!'}
            </h2>
            <p className="text-gray-600">Manage your custody case from one place.</p>
          </div>
          <Link href="/progress" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:border-red-300 transition-colors">
            <span className="text-sm">📊</span>
            <span className="text-sm text-gray-600 font-medium">My Progress</span>
          </Link>
        </div>

        {/* Getting Started Guide - only for users who haven't started a case */}
        {(!actionPlan || actionPlan.length === 0) && (!userProfile?.case_status || userProfile.case_status === 'no_case' || userProfile.case_status === 'preparing') && (
          <div className="mb-6 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-5 text-white">
            <h3 className="font-bold text-lg mb-1">Start Your Custody Journey</h3>
            <p className="text-red-100 text-sm mb-4">Follow these steps to build your case. Foresight will guide you through each one.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { step: '1', label: 'Learn Your Rights', link: '/rights' },
                { step: '2', label: 'Read Filing Guide', link: '/filing' },
                { step: '3', label: 'Get Court Forms', link: '/court-forms' },
                { step: '4', label: 'Start Your Case', link: '/cases' },
              ].map(s => (
                <Link key={s.step} href={s.link} className="bg-white/10 hover:bg-white/20 rounded-xl p-3 text-center transition-colors">
                  <div className="text-lg font-bold mb-0.5">{s.step}</div>
                  <div className="text-xs text-red-100">{s.label}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Deadline Reminders */}
        {upcomingDeadlines.length > 0 && (
          <div className="mb-6">
            {upcomingDeadlines.map(d => {
              const daysLeft = Math.ceil((new Date(d.due_date) - new Date()) / 86400000);
              const isUrgent = daysLeft <= 3;
              const isToday = daysLeft <= 0;
              return (
                <Link key={d.id} href="/deadlines"
                  className={`flex items-center gap-3 p-3 rounded-xl mb-2 transition-colors ${
                    isToday ? 'bg-red-50 border-2 border-red-300' :
                    isUrgent ? 'bg-amber-50 border border-amber-200' :
                    'bg-blue-50 border border-blue-200'
                  }`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    isToday ? 'bg-red-600 text-white' : isUrgent ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'
                  }`}>
                    {isToday ? '!' : daysLeft}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm ${isToday ? 'text-red-800' : isUrgent ? 'text-amber-800' : 'text-blue-800'}`}>
                      {d.title}
                    </div>
                    <div className={`text-xs ${isToday ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-blue-600'}`}>
                      {isToday ? 'Due today!' : daysLeft === 1 ? 'Due tomorrow' : `Due in ${daysLeft} days`}
                      {' · '}{new Date(d.due_date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    d.priority === 'high' ? 'bg-red-100 text-red-700' :
                    d.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{d.priority}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Action Plan */}
        {actionPlan && actionPlan.length > 0 && (
          <div className="mb-8 bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">🎯 Your Action Plan</h3>
              <span className="text-xs text-gray-400">Based on your case questionnaire</span>
            </div>
            <div className="space-y-2">
              {actionPlan.slice(0, 5).map((item, i) => (
                <Link key={i} href={item.link || '/cases'}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 hover:bg-red-50 hover:border-red-200 border border-gray-100 transition-colors">
                  <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{item.step}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm">{item.title}</div>
                    <div className="text-xs text-gray-500 truncate">{item.desc}</div>
                  </div>
                  <span className="text-gray-400 text-sm">→</span>
                </Link>
              ))}
              {actionPlan.length > 5 && (
                <p className="text-xs text-gray-400 text-center pt-1">+ {actionPlan.length - 5} more steps</p>
              )}
            </div>
          </div>
        )}

        {/* QUICK LINKS */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link href="/cases" className="bg-white border-2 border-red-200 rounded-xl p-4 hover:border-red-500 hover:shadow-md transition-all flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-xl">📁</div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">My Case</h3>
              <p className="text-xs text-gray-500">Documents & AI chat</p>
            </div>
          </Link>
          <Link href="/deadlines" className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-500 hover:shadow-md transition-all flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl">📅</div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Calendar & Deadlines</h3>
              <p className="text-xs text-gray-500">Schedule & reminders</p>
            </div>
          </Link>
        </div>

        {/* YOUR CASE TOOLS */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">Case Tools</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {[
              { href: '/coparent', icon: '💬', label: 'Co-Parent Chat' },
              { href: '/expenses', icon: '💰', label: 'Expenses' },
              { href: '/children', icon: '👧', label: "Children's Info" },
              { href: '/templates', icon: '📝', label: 'Templates' },
            ].map(item => (
              <Link key={item.href} href={item.href} className="bg-white border border-gray-200 rounded-xl p-3 hover:border-red-300 hover:shadow-sm transition-all text-center">
                <div className="text-xl mb-1">{item.icon}</div>
                <div className="text-[11px] font-medium text-gray-700">{item.label}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* LEARN & PREPARE */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">Learn & Prepare</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {[
              { href: '/filing', icon: '📋', label: 'Filing Guide' },
              { href: '/court-forms', icon: '📄', label: 'Court Forms' },
              { href: '/rights', icon: '⚖️', label: 'Your Rights' },
              { href: '/judge-insight', icon: '🏛️', label: 'Court Tips' },
              { href: '/calculator', icon: '🧮', label: 'Calculator' },
              { href: '/programs', icon: '🛡️', label: 'Programs' },
            ].map(item => (
              <Link key={item.href} href={item.href} className="bg-white border border-gray-200 rounded-xl p-3 hover:border-red-300 hover:shadow-sm transition-all text-center">
                <div className="text-xl mb-1">{item.icon}</div>
                <div className="text-[11px] font-medium text-gray-700">{item.label}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* COMMUNITY & SUPPORT */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">Community & Support</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/community" className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-300 hover:shadow-sm transition-all flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-xl">💬</div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Community</h3>
                <p className="text-xs text-gray-500">Chat, posts & mentors</p>
              </div>
            </Link>
            <Link href="/emergency" className="bg-red-50 border-2 border-red-200 rounded-xl p-4 hover:border-red-500 hover:shadow-sm transition-all flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-xl">🚨</div>
              <div>
                <h3 className="font-semibold text-red-700 text-sm">Emergency</h3>
                <p className="text-xs text-red-500">Crisis & urgent help</p>
              </div>
            </Link>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
      }

/* ============================================ */

// ─── Smart Case Status Banner ──────────────────────────────────────────────────
const STATUS_CONFIG = {
  no_case: {
    colour: 'blue',
    icon: '🔍',
    headline: 'Start by understanding your options.',
    action: 'Read the Filing Guide to see what to expect and which situation applies to you.',
    link: '/filing',
    linkLabel: 'Open Filing Guide →',
  },
  preparing: {
    colour: 'amber',
    icon: '📝',
    headline: "You're preparing to file.",
    action: 'Your next step is to get your document checklist together. See exactly what you need below.',
    link: '/court-forms',
    linkLabel: 'Get Court Forms →',
  },
  filed: {
    colour: 'purple',
    icon: '📋',
    headline: 'Your application is filed.',
    action: 'Now you need to serve the other party. Check the filing guide for exact service requirements.',
    link: '/filing',
    linkLabel: 'View Service Steps →',
  },
  waiting_hearing: {
    colour: 'red',
    icon: '⏳',
    headline: 'You have a hearing coming up.',
    action: "Review the Judge Insight tips to make sure you're presenting yourself as well as possible.",
    link: '/judge-insight',
    linkLabel: 'Court Tips →',
  },
  mediation: {
    colour: 'green',
    icon: '🤝',
    headline: "You're in mediation.",
    action: 'Use the Co-Parent Messenger to keep communication documented and professional.',
    link: '/coparent',
    linkLabel: 'Open Co-Parent Chat →',
  },
  responding: {
    colour: 'orange',
    icon: '📩',
    headline: "You've been served — time to respond.",
    action: 'You have 30 days to file an Answer. Read the filing guide for your situation now.',
    link: '/filing',
    linkLabel: 'See Response Steps →',
  },
  cps: {
    colour: 'red',
    icon: '🛡️',
    headline: 'CPS is involved in your case.',
    action: 'Know your rights immediately. The Rights page explains what investigators can and cannot do.',
    link: '/rights',
    linkLabel: 'Your Rights →',
  },
  modification: {
    colour: 'purple',
    icon: '🔄',
    headline: "You're changing an existing order.",
    action: 'Open the Filing Guide and select "Change an Existing Order" to see the variation steps.',
    link: '/filing',
    linkLabel: 'Variation Steps →',
  },
};

const COLOUR_MAP = {
  blue:   { bg: 'bg-blue-50 border-blue-200',   icon: 'bg-blue-100', text: 'text-blue-900',  sub: 'text-blue-700',  btn: 'bg-blue-600 hover:bg-blue-700' },
  amber:  { bg: 'bg-amber-50 border-amber-200',  icon: 'bg-amber-100', text: 'text-amber-900', sub: 'text-amber-700', btn: 'bg-amber-600 hover:bg-amber-700' },
  purple: { bg: 'bg-purple-50 border-purple-200', icon: 'bg-purple-100', text: 'text-purple-900', sub: 'text-purple-700', btn: 'bg-purple-600 hover:bg-purple-700' },
  red:    { bg: 'bg-red-50 border-red-200',      icon: 'bg-red-100',  text: 'text-red-900',   sub: 'text-red-700',   btn: 'bg-red-600 hover:bg-red-700' },
  green:  { bg: 'bg-green-50 border-green-200',  icon: 'bg-green-100', text: 'text-green-900', sub: 'text-green-700', btn: 'bg-green-600 hover:bg-green-700' },
  orange: { bg: 'bg-orange-50 border-orange-200', icon: 'bg-orange-100', text: 'text-orange-900', sub: 'text-orange-700', btn: 'bg-orange-600 hover:bg-orange-700' },
};

function SmartStatusBanner({ profile }) {
  const cfg = STATUS_CONFIG[profile.case_status];
  if (!cfg) return null;
  const c = COLOUR_MAP[cfg.colour] || COLOUR_MAP.blue;

  return (
    <div className={`mb-5 border rounded-2xl p-4 flex items-start gap-4 ${c.bg}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${c.icon}`}>
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm mb-0.5 ${c.text}`}>{cfg.headline}</p>
        <p className={`text-xs leading-relaxed mb-3 ${c.sub}`}>{cfg.action}</p>
        <Link
          href={cfg.link}
          className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors ${c.btn}`}
        >
          {cfg.linkLabel}
        </Link>
      </div>
    </div>
  );
}

// ─── Document Checklist ────────────────────────────────────────────────────────
const DOC_CHECKLISTS = {
  default: [
    { key: 'doc_id', label: "Government-issued photo ID (driver's licence or passport)", category: 'Identity' },
    { key: 'doc_children_bc', label: 'Birth certificate(s) for each child', category: 'Children' },
    { key: 'doc_children_school', label: 'School information for each child (name, grade, address)', category: 'Children' },
    { key: 'doc_separation_date', label: 'Written record of your exact separation date', category: 'Relationship' },
    { key: 'doc_t1_returns', label: '3 years of T1 tax returns and Notices of Assessment', category: 'Financial' },
    { key: 'doc_pay_stubs', label: '3 months of recent pay stubs', category: 'Financial' },
    { key: 'doc_bank_statements', label: '3 months of bank statements for all accounts', category: 'Financial' },
    { key: 'doc_address_proof', label: 'Proof of your current address (utility bill, lease)', category: 'Housing' },
    { key: 'doc_other_address', label: "Other parent's full name and current address", category: 'Other Party' },
  ],
  divorce: [
    { key: 'doc_marriage_cert', label: 'Original marriage certificate', category: 'Marriage' },
    { key: 'doc_id', label: 'Government-issued photo ID', category: 'Identity' },
    { key: 'doc_children_bc', label: 'Birth certificate(s) for each child', category: 'Children' },
    { key: 'doc_separation_date', label: 'Written record of your exact separation date', category: 'Relationship' },
    { key: 'doc_t1_returns', label: '3 years of T1 tax returns and Notices of Assessment', category: 'Financial' },
    { key: 'doc_pay_stubs', label: '3 months of recent pay stubs', category: 'Financial' },
    { key: 'doc_bank_statements', label: '3 months of bank statements', category: 'Financial' },
    { key: 'doc_assets_list', label: 'List of all assets: home, vehicles, savings, investments', category: 'Property' },
    { key: 'doc_debts_list', label: 'List of all debts: mortgage, loans, credit cards', category: 'Property' },
    { key: 'doc_address_proof', label: 'Proof of your current address', category: 'Housing' },
    { key: 'doc_other_address', label: "Other spouse's full name and current address", category: 'Other Party' },
    { key: 'doc_kids_sake', label: 'For Kids' Sake course certificate (if children involved)', category: 'Required Courses' },
  ],
  custody: [
    { key: 'doc_id', label: 'Government-issued photo ID', category: 'Identity' },
    { key: 'doc_children_bc', label: 'Birth certificate(s) for each child', category: 'Children' },
    { key: 'doc_children_school', label: 'School name, grade, and address for each child', category: 'Children' },
    { key: 'doc_children_doctor', label: "Children's doctor name and contact info", category: 'Children' },
    { key: 'doc_current_schedule', label: 'Written record of current parenting arrangement (if any)', category: 'Parenting' },
    { key: 'doc_t1_returns', label: '3 years of T1 tax returns and Notices of Assessment', category: 'Financial' },
    { key: 'doc_pay_stubs', label: '3 months of recent pay stubs', category: 'Financial' },
    { key: 'doc_address_proof', label: 'Proof of your current address', category: 'Housing' },
    { key: 'doc_other_address', label: "Other parent's full name and current address", category: 'Other Party' },
    { key: 'doc_kids_sake', label: 'For Kids' Sake course certificate', category: 'Required Courses' },
    { key: 'doc_incidents', label: 'Any police reports, medical records, or texts relevant to your case', category: 'Evidence' },
  ],
  support: [
    { key: 'doc_id', label: 'Government-issued photo ID', category: 'Identity' },
    { key: 'doc_children_bc', label: 'Birth certificate(s) for each child', category: 'Children' },
    { key: 'doc_t1_returns', label: '3 years of T1 tax returns and Notices of Assessment — yours', category: 'Financial (You)' },
    { key: 'doc_pay_stubs', label: '3 months of recent pay stubs — yours', category: 'Financial (You)' },
    { key: 'doc_t1_other', label: 'Other parent's most recent T1 return (if available)', category: 'Financial (Other)' },
    { key: 'doc_child_expenses', label: 'Receipts for child expenses: daycare, activities, medical', category: 'Expenses' },
    { key: 'doc_existing_order', label: 'Copy of any existing support order (if varying)', category: 'Existing Orders' },
  ],
  variation: [
    { key: 'doc_existing_order', label: 'Full copy of the existing court order you want to change', category: 'Existing Order' },
    { key: 'doc_court_file_num', label: 'Court file number from the original order', category: 'Existing Order' },
    { key: 'doc_change_evidence', label: 'Evidence of the significant change in circumstances', category: 'Change Evidence' },
    { key: 'doc_id', label: 'Government-issued photo ID', category: 'Identity' },
    { key: 'doc_t1_returns', label: '3 years of T1 tax returns and Notices of Assessment', category: 'Financial' },
    { key: 'doc_pay_stubs', label: '3 months of recent pay stubs', category: 'Financial' },
    { key: 'doc_other_address', label: 'Other party's full name and current address', category: 'Other Party' },
  ],
  protection: [
    { key: 'doc_id', label: 'Government-issued photo ID', category: 'Identity' },
    { key: 'doc_children_bc', label: 'Birth certificate(s) for each child', category: 'Children' },
    { key: 'doc_incident_log', label: 'Detailed written log of all concerning incidents (dates, what happened)', category: 'Evidence' },
    { key: 'doc_police_reports', label: 'Any police reports filed', category: 'Evidence' },
    { key: 'doc_medical_records', label: 'Medical records related to injuries or assessments', category: 'Evidence' },
    { key: 'doc_texts_emails', label: 'Printed or screenshot copies of relevant texts and emails', category: 'Evidence' },
    { key: 'doc_witnesses', label: 'Names and contact info of any witnesses', category: 'Evidence' },
    { key: 'doc_address_proof', label: 'Proof of your current safe address', category: 'Housing' },
  ],
};

const CATEGORY_ICONS = {
  'Identity': '🪪',
  'Children': '👧',
  'Marriage': '💍',
  'Relationship': '📅',
  'Financial': '💰',
  'Financial (You)': '💰',
  'Financial (Other)': '💵',
  'Housing': '🏠',
  'Property': '🏡',
  'Other Party': '👤',
  'Required Courses': '📜',
  'Parenting': '🤝',
  'Evidence': '📁',
  'Existing Order': '⚖️',
  'Existing Orders': '⚖️',
  'Change Evidence': '🔄',
  'Expenses': '🧾',
};

function DocChecklist({ profile, checklist, userId, onToggle }) {
  const [open, setOpen] = useState(false);
  const items = DOC_CHECKLISTS[profile.case_type] || DOC_CHECKLISTS.default;
  const checked = items.filter(i => checklist[i.key]).length;
  const total = items.length;
  const pct = total > 0 ? Math.round((checked / total) * 100) : 0;

  // Group by category
  const grouped = {};
  items.forEach(item => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });

  const caseLabels = {
    divorce: 'Divorce',
    custody: 'Parenting / Custody',
    support: 'Child Support',
    protection: 'Child Protection (CPS)',
    variation: 'Variation of Order',
    default: 'Family Law',
  };

  return (
    <div className="mb-5 bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
          📂
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-gray-900 text-sm">Document Checklist</p>
            <span className="text-xs text-gray-400 font-normal">
              {caseLabels[profile.case_type] || 'Family Law'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className={`text-xs font-semibold flex-shrink-0 ${pct === 100 ? 'text-emerald-600' : 'text-gray-500'}`}>
              {checked}/{total} {pct === 100 ? '✅' : ''}
            </span>
          </div>
        </div>
        <span className="text-gray-400 text-sm flex-shrink-0">{open ? '▲' : '▼'}</span>
      </button>

      {/* Expanded checklist */}
      {open && (
        <div className="border-t border-gray-100 divide-y divide-gray-50">
          {pct === 100 && (
            <div className="px-4 py-3 bg-emerald-50">
              <p className="text-emerald-700 text-sm font-medium">
                🎉 You have everything! You're ready to move to the next step.
              </p>
            </div>
          )}
          {Object.entries(grouped).map(([category, catItems]) => (
            <div key={category} className="px-4 py-3">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-sm">{CATEGORY_ICONS[category] || '📋'}</span>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{category}</p>
              </div>
              <div className="space-y-2">
                {catItems.map(item => {
                  const isChecked = !!checklist[item.key];
                  return (
                    <button
                      key={item.key}
                      onClick={() => onToggle(item.key, !isChecked)}
                      className="w-full flex items-start gap-3 text-left group"
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        isChecked
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-gray-300 group-hover:border-emerald-400'
                      }`}>
                        {isChecked && <span className="text-[10px] font-bold">✓</span>}
                      </div>
                      <span className={`text-sm leading-snug ${isChecked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="px-4 py-3 bg-gray-50">
            <p className="text-xs text-gray-400">
              ✓ Tap each item as you gather it. Your progress saves automatically.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* QUESTION BAR - AI Quick Ask */
/* ============================================ */
function QuestionBar() {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUser(user);
        supabase.from('users').select('jurisdiction, tier, ai_trial_used, daily_queries_used').eq('id', user.id).single()
          .then(({ data }) => setCurrentProfile(data));
      }
    });
  }, []);

  const suggestions = [
    'How do I file for custody?',
    'What is a parenting plan?',
    'How does child support work?',
    'What happens at a court hearing?',
    'How do I respond to a filing?',
    'What are my rights as a parent?',
  ];

  const handleAsk = async (question) => {
    const q = question || query.trim();
    if (!q) return;
    setQuery(q);
    setShowAnswer(true);
    setShowSuggestions(false);
    setLoading(true);
    setAnswer('');

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q, userId: currentUser?.id, jurisdiction: currentProfile?.jurisdiction }),
      });
      const data = await response.json();
      if (data.upgradeRequired) {
        setAnswer('🔒 AI is a premium feature. Upgrade to Silver or Gold to ask unlimited questions!');
      } else {
        setAnswer(data.content || 'Sorry, I couldn\'t process that. Please try again.');
      }
    } catch (err) {
      setAnswer('Sorry, the AI assistant is currently unavailable. Please try again later or visit our Filing Guide for help.');
    }
    setLoading(false);
  };

  return (
    <div className="mb-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">?</span>
          </div>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              placeholder="Unsure of what to do next? Just Ask AI"
              className="w-full py-2.5 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-400 focus:bg-white transition-colors"
            />
          </div>
          <button
            onClick={() => handleAsk()}
            disabled={!query.trim() || loading}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium disabled:opacity-40 transition-colors flex-shrink-0"
          >
            {loading ? '...' : 'Ask'}
          </button>
        </div>

        {/* Suggested Questions - collapsed behind toggle */}
        {!showAnswer && (
          <div className="mt-2">
            <button onClick={() => setShowSuggestions(!showSuggestions)}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1">
              <span className={`transition-transform ${showSuggestions ? 'rotate-90' : ''}`}>▸</span>
              Suggested questions
            </button>
            {showSuggestions && (
              <div className="flex flex-wrap gap-2 mt-2">
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => { setQuery(s); handleAsk(s); }}
                    className="px-3 py-1.5 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-full text-xs text-gray-600 hover:text-red-600 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Answer Panel */}
      {showAnswer && (
        <div className="mt-3 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">F</div>
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="flex items-center gap-2 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <span className="text-sm text-gray-400">Thinking...</span>
                </div>
              ) : (
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{answer}</div>
              )}
            </div>
          </div>
          {!loading && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <p className="text-[10px] text-gray-400">This is general information, not legal advice.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowAnswer(false); setQuery(''); setAnswer(''); inputRef.current?.focus(); }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Ask another →
                </button>
                <Link href="/cases" className="text-xs text-red-600 hover:text-red-700 font-medium">
                  Open My Case →
                </Link>
              </div>
            </div>
          )}
      </div>
      )}
    </div>
  );
}