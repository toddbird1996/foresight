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
        {userProfile && <CaseWalkthroughBanner profile={userProfile} />}



        {/* Case Guide - Step by Step Walkthrough */}
        {/* Hearing Prep Checklist - auto-surfaces when hearing deadline within 14 days */}
        {user && upcomingDeadlines.some(d => d.event_type === 'court' || d.event_type === 'hearing' || (d.title && (d.title.toLowerCase().includes('hearing') || d.title.toLowerCase().includes('trial') || d.title.toLowerCase().includes('court') || d.title.toLowerCase().includes('jcc')))) && (
          <HearingPrepChecklist deadlines={upcomingDeadlines} userId={user.id} />
        )}

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

// ─── Case Walkthrough Banner ─────────────────────────────────────────────────
const WALKTHROUGH = {
  no_case: {
    colour: { bg: 'bg-blue-50 border-blue-200', badge: 'bg-blue-100 text-blue-700', head: 'text-blue-900', sub: 'text-blue-700', btn: 'bg-blue-600 hover:bg-blue-700', step: 'bg-blue-200 text-blue-800', mand: 'bg-blue-600', opt: 'bg-blue-200' },
    icon: '🔍', label: 'Getting Started',
    headline: "Let's figure out where you stand.",
    summary: "Before filing anything, take a few minutes to understand your situation and what the court process looks like for your case type.",
    steps: [
      { title: "Read the Filing Guide", desc: "Choose your situation — Divorce, Parenting Only, or Variation — and see the exact phases ahead of you.", link: '/filing', linkLabel: 'Open Filing Guide', mandatory: true },
      { title: "Know your rights", desc: "Saskatchewan's Children's Law Act governs how courts decide parenting matters. Understanding it changes how you prepare.", link: '/rights', linkLabel: 'Your Rights', mandatory: true },
      { title: "Review legal terms", desc: "Terms like parenting time, decision-making responsibility, affidavit, and JCC come up constantly. Know them before you file.", link: '/glossary', linkLabel: 'Legal Glossary', mandatory: false },
      { title: "Calculate child support", desc: "Get an estimate of what the guidelines say before you walk into court. It helps you know what to expect.", link: '/calculator', linkLabel: 'Run Estimate', mandatory: false },
    ],
  },
  preparing: {
    colour: { bg: 'bg-amber-50 border-amber-200', badge: 'bg-amber-100 text-amber-700', head: 'text-amber-900', sub: 'text-amber-700', btn: 'bg-amber-600 hover:bg-amber-700', step: 'bg-amber-200 text-amber-800', mand: 'bg-amber-500', opt: 'bg-amber-200' },
    icon: '📝', label: 'Preparing to File',
    headline: "You're preparing to file. Here's exactly what you need.",
    summary: "Before you can file, you need the right documents and completed requirements. Missing any mandatory item will delay your application.",
    steps: [
      { title: "Request your self-help kit", desc: "Call the Family Law Information Centre (free). Specify your situation: Divorce, Parenting & Support, or Variation. Ask for the fillable PDF.", link: '/court-forms', linkLabel: 'Court Forms & Kit Info', mandatory: true, detail: "📞 1-888-218-2822 · familylaw@gov.sk.ca" },
      { title: "Complete For Kids' Sake course", desc: "Mandatory for any case involving children. Must be done BEFORE filing. Register at saskatchewanforkidssake.ca.", link: 'https://www.saskatchewanforkidssake.ca/', linkLabel: 'Register Now', mandatory: true, detail: "~$25 · Takes a few hours · You get a certificate to attach to your filing" },
      { title: "Gather your financial documents", desc: "3 years of T1 tax returns, 3 months of pay stubs, and 3 months of bank statements for all accounts.", link: null, linkLabel: null, mandatory: true, detail: "Required whenever child or spousal support is part of your application" },
      { title: "Gather identity & children's documents", desc: "Your photo ID, children's birth certificates, marriage certificate (if divorce), and children's school and doctor info.", link: null, linkLabel: null, mandatory: true },
      { title: "Get a Commissioner for Oaths lined up", desc: "Your affidavit must be signed in front of one. Available at most law offices and banks — usually free.", link: null, linkLabel: null, mandatory: true },
      { title: "Collect evidence relevant to your case", desc: "Texts, emails, police reports, medical records, photos — anything that supports what you are telling the court.", link: null, linkLabel: null, mandatory: false, detail: "Optional but strongly recommended for contested cases" },
      { title: "Create your case file in Foresight", desc: "Store your documents, track deadlines, and use the AI assistant from one place.", link: '/cases', linkLabel: 'My Case', mandatory: false },
    ],
  },
  filed: {
    colour: { bg: 'bg-purple-50 border-purple-200', badge: 'bg-purple-100 text-purple-700', head: 'text-purple-900', sub: 'text-purple-700', btn: 'bg-purple-600 hover:bg-purple-700', step: 'bg-purple-200 text-purple-800', mand: 'bg-purple-600', opt: 'bg-purple-200' },
    icon: '📋', label: 'Filed — Awaiting Service',
    headline: "Your application is filed. Now you need to serve the other party.",
    summary: "Filing is step one. The other parent must be personally served — you cannot do it yourself. Until service is confirmed with the court, nothing proceeds.",
    steps: [
      { title: "Arrange personal service", desc: "An adult (18+) who is not involved in the case must hand the documents directly to the other parent. You cannot serve them yourself.", link: '/filing', linkLabel: 'Service Steps', mandatory: true },
      { title: "Complete the Affidavit of Service (Form 12-15)", desc: "The person who served the documents fills this out and swears it before a Commissioner for Oaths. This is your proof of service.", link: '/court-forms', linkLabel: 'Get Form 12-15', mandatory: true },
      { title: "File proof of service with the court", desc: "Submit the sworn Affidavit of Service to the court registry. Without this, your case cannot proceed.", link: null, linkLabel: null, mandatory: true },
      { title: "Set a deadline reminder", desc: "The other parent has 30 days to respond (60 days if outside SK). Set a reminder so you know when you can move forward.", link: '/deadlines', linkLabel: 'Set Reminder', mandatory: false },
    ],
  },
  waiting_hearing: {
    colour: { bg: 'bg-red-50 border-red-200', badge: 'bg-red-100 text-red-700', head: 'text-red-900', sub: 'text-red-700', btn: 'bg-red-600 hover:bg-red-700', step: 'bg-red-100 text-red-800', mand: 'bg-red-600', opt: 'bg-red-200' },
    icon: '⏳', label: 'Hearing Approaching',
    headline: "You have a court appearance coming up. Prepare now.",
    summary: "How you present yourself in court matters as much as your evidence. Judges are watching everything. Use this time to be as prepared as possible.",
    steps: [
      { title: "Read the Judge Insight tips", desc: "Everything from what to wear to how to address the judge to what not to do when the other parent is lying. Critical reading.", link: '/judge-insight', linkLabel: 'Court Tips', mandatory: true },
      { title: "Organize your documents into a binder", desc: "Tab and label every document chronologically. You must be able to find anything in seconds. Bring 3 copies of everything.", link: null, linkLabel: null, mandatory: true, detail: "One for the judge, one for the other party, one for you" },
      { title: "Review your JCC Brief or evidence package", desc: "Know exactly what you filed. The judge will have read it. Be ready to discuss every point.", link: null, linkLabel: null, mandatory: true },
      { title: "Prepare what you will say", desc: "Write bullet points — not a script. Practice saying your key points out loud. Have a friend challenge you with hard questions.", link: null, linkLabel: null, mandatory: true },
      { title: "Know the other parent's likely arguments", desc: "Think through what they will say and prepare calm, factual, evidence-backed responses.", link: null, linkLabel: null, mandatory: false },
      { title: "Arrange childcare for the court date", desc: "Children must not be present in court waiting areas. Arrange care in advance.", link: null, linkLabel: null, mandatory: false },
    ],
  },
  mediation: {
    colour: { bg: 'bg-green-50 border-green-200', badge: 'bg-green-100 text-green-700', head: 'text-green-900', sub: 'text-green-700', btn: 'bg-green-600 hover:bg-green-700', step: 'bg-green-100 text-green-800', mand: 'bg-green-600', opt: 'bg-green-200' },
    icon: '🤝', label: 'In Mediation',
    headline: "You're in mediation. Keep communication professional and documented.",
    summary: "Mediation is an opportunity to settle without a judge deciding for you. What you agree to here can become a legally binding consent order.",
    steps: [
      { title: "Use the Co-Parent Messenger for all communication", desc: "Every message is timestamped and stored. Professional written communication protects you and demonstrates maturity to the court if needed.", link: '/coparent', linkLabel: 'Co-Parent Chat', mandatory: false },
      { title: "Know your bottom line before each session", desc: "Decide in advance what you can and cannot agree to. Mediation moves fast — don't agree to something you'll regret.", link: null, linkLabel: null, mandatory: true },
      { title: "Bring your financial disclosure to each session", desc: "Mediators need accurate income information to help with support discussions.", link: null, linkLabel: null, mandatory: true },
      { title: "If you reach agreement — get it in writing immediately", desc: "A verbal agreement in mediation is not binding. A written Consent Order filed with the court is.", link: '/court-forms', linkLabel: 'Consent Order Info', mandatory: true },
    ],
  },
  responding: {
    colour: { bg: 'bg-orange-50 border-orange-200', badge: 'bg-orange-100 text-orange-700', head: 'text-orange-900', sub: 'text-orange-700', btn: 'bg-orange-600 hover:bg-orange-700', step: 'bg-orange-100 text-orange-800', mand: 'bg-orange-600', opt: 'bg-orange-200' },
    icon: '📩', label: 'Responding to Papers',
    headline: "You've been served. You have 30 days to respond.",
    summary: "If you miss the 30-day deadline to file your Answer, the court can proceed without you and make orders based only on what the other parent asked for.",
    steps: [
      { title: "Read every page of what you were served", desc: "Understand exactly what they are asking for. Note every claim you disagree with — these are the issues you will address in your Answer.", link: null, linkLabel: null, mandatory: true },
      { title: "Contact Legal Aid immediately if you can't afford a lawyer", desc: "Legal Aid Saskatchewan: 1-800-667-3764. Even a consultation helps. The 30-day clock is running.", link: null, linkLabel: null, mandatory: true, detail: "📞 1-800-667-3764" },
      { title: "File your Answer (Form 15-14A) within 30 days", desc: "Your Answer tells the court what you agree with, what you disagree with, and what orders you want. This is your opportunity to be heard.", link: '/court-forms', linkLabel: 'Get Form 15-14A', mandatory: true },
      { title: "Complete For Kids' Sake if children are involved", desc: "Even as a respondent, you must complete this course. Register at saskatchewanforkidssake.ca.", link: 'https://www.saskatchewanforkidssake.ca/', linkLabel: 'Register', mandatory: true },
      { title: "File a Financial Statement if support is claimed", desc: "If they are asking for child or spousal support, you must respond with your own financial disclosure.", link: '/court-forms', linkLabel: 'Forms', mandatory: true, detail: "Failure to disclose finances can result in serious penalties" },
    ],
  },
  cps: {
    colour: { bg: 'bg-rose-50 border-rose-200', badge: 'bg-rose-100 text-rose-700', head: 'text-rose-900', sub: 'text-rose-700', btn: 'bg-rose-600 hover:bg-rose-700', step: 'bg-rose-100 text-rose-800', mand: 'bg-rose-600', opt: 'bg-rose-200' },
    icon: '🛡️', label: 'CPS Involved',
    headline: "CPS is involved. Know your rights before anything else.",
    summary: "Child Protection proceedings are different from family court. The ministry has legal obligations AND limits on what they can do. Understanding both protects you and your children.",
    steps: [
      { title: "Read your rights under the Child and Family Services Act immediately", desc: "Officers must notify you in writing, must offer family services before removal, and must tell you to get a lawyer. Know what they must do.", link: '/rights', linkLabel: 'Your CPS Rights', mandatory: true },
      { title: "Get a lawyer — today if possible", desc: "CPS cases move fast and the consequences are serious. Legal Aid Saskatchewan handles CPS matters: 1-800-667-3764.", link: null, linkLabel: null, mandatory: true, detail: "📞 Legal Aid SK: 1-800-667-3764 · Saskatchewan Advocate for Children: 1-800-322-7221" },
      { title: "Document everything with dates and times", desc: "Every interaction with a worker — write it down immediately after. What was said, who was there, what was decided.", link: null, linkLabel: null, mandatory: true },
      { title: "Do not sign anything without legal advice", desc: "Voluntary service agreements and consent forms can have long-term implications. Read everything carefully and get advice first.", link: null, linkLabel: null, mandatory: true },
      { title: "Contact the Saskatchewan Advocate for Children and Youth", desc: "They are independent of the ministry and can provide information and support for children and families.", link: null, linkLabel: null, mandatory: false, detail: "📞 1-800-322-7221" },
      { title: "Use the Emergency page for crisis contacts", desc: "Mobile Crisis Services, child abuse hotlines, and family violence resources are listed there.", link: '/emergency', linkLabel: 'Emergency Contacts', mandatory: false },
    ],
  },
  modification: {
    colour: { bg: 'bg-indigo-50 border-indigo-200', badge: 'bg-indigo-100 text-indigo-700', head: 'text-indigo-900', sub: 'text-indigo-700', btn: 'bg-indigo-600 hover:bg-indigo-700', step: 'bg-indigo-100 text-indigo-800', mand: 'bg-indigo-600', opt: 'bg-indigo-200' },
    icon: '🔄', label: 'Varying an Existing Order',
    headline: "You're applying to change an existing order.",
    summary: "Courts only vary orders when there has been a significant change in circumstances since the original order. You must be able to show what changed and why it matters.",
    steps: [
      { title: "Confirm you have grounds — significant change in circumstances", desc: "Examples: major income change, one parent relocating, children's needs changing significantly, new evidence of risk. Minor disagreements are not enough.", link: '/filing', linkLabel: 'Variation Steps', mandatory: true },
      { title: "Locate your existing order and court file number", desc: "You need the exact wording of what you want to change and the file number. Contact the court registry if you can't find it.", link: null, linkLabel: null, mandatory: true },
      { title: "Request the Variation Self-Help Kit", desc: "The forms are different from a new application. Call 1-888-218-2822 and specify you are applying to vary.", link: '/court-forms', linkLabel: 'Kit Info', mandatory: true, detail: "📞 1-888-218-2822 · familylaw@gov.sk.ca" },
      { title: "Gather updated financial documents if varying support", desc: "Current T1 returns, recent pay stubs, and any evidence of changed circumstances.", link: null, linkLabel: null, mandatory: false, detail: "Only required if the variation involves child or spousal support" },
    ],
  },
};

function CaseWalkthroughBanner({ profile }) {
  const [expanded, setExpanded] = useState(false);
  const status = profile.case_status || 'no_case';
  const data = WALKTHROUGH[status];
  if (!data) return null;
  const c = data.colour;
  const mandatoryCount = data.steps.filter(s => s.mandatory).length;
  const optionalCount = data.steps.filter(s => !s.mandatory).length;

  return (
    <div className={`mb-5 border-2 rounded-2xl overflow-hidden ${c.bg}`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div className="text-2xl flex-shrink-0">{data.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${c.badge}`}>{data.label}</span>
            <span className={`text-[10px] ${c.sub}`}>{mandatoryCount} required · {optionalCount} optional</span>
          </div>
          <p className={`font-bold text-sm leading-snug ${c.head}`}>{data.headline}</p>
        </div>
        <span className={`text-lg flex-shrink-0 ${c.head}`}>{expanded ? '▲' : '▼'}</span>
      </button>

      {/* Body */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/40">
          <p className={`text-xs leading-relaxed pt-3 ${c.sub}`}>{data.summary}</p>

          <div className="space-y-2">
            {data.steps.map((step, i) => (
              <div key={i} className="bg-white rounded-xl p-3 shadow-sm">
                <div className="flex items-start gap-3">
                  {/* Number + mandatory indicator */}
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${step.mandatory ? c.mand : 'bg-gray-300'}`}>
                      {i + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="font-semibold text-gray-900 text-sm">{step.title}</p>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${step.mandatory ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                        {step.mandatory ? 'Required' : 'Optional'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{step.desc}</p>
                    {step.detail && (
                      <p className="text-xs text-gray-400 mt-1 italic">{step.detail}</p>
                    )}
                    {step.link && step.linkLabel && (
                      <Link
                        href={step.link}
                        className={`inline-flex items-center gap-1 mt-2 text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition-colors ${c.btn}`}
                      >
                        {step.linkLabel} →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 pt-1">
            <span className="w-3 h-3 rounded-full bg-red-600 flex-shrink-0" />
            <span className="text-xs text-gray-500">Required steps</span>
            <span className="w-3 h-3 rounded-full bg-gray-300 flex-shrink-0 ml-2" />
            <span className="text-xs text-gray-500">Optional but recommended</span>
          </div>
        </div>
      )}
    </div>
  );
}


// ─── Hearing Prep Checklist ────────────────────────────────────────────────────
const HEARING_PREP_ITEMS = [
  // Documents — all Required
  { key: 'hp_binder', label: 'Organize all documents into a tabbed binder', category: 'Documents', mandatory: true, detail: 'Tab and label chronologically. Bring 3 copies of everything — one for you, one for the judge, one for the other party.' },
  { key: 'hp_filed_docs', label: 'Review every document you have filed', category: 'Documents', mandatory: true, detail: 'Know your affidavits, financial statements, and any exhibits inside out. The judge will have read them.' },
  { key: 'hp_other_docs', label: "Review the other party's filed documents", category: 'Documents', mandatory: true, detail: "Note every point you disagree with and prepare a calm, evidence-backed response for each one." },
  { key: 'hp_evidence', label: 'Organize your supporting evidence', category: 'Documents', mandatory: true, detail: 'Texts, emails, photos, police reports, school records, medical records — tabbed and ready to hand up.' },
  // Preparation — mix
  { key: 'hp_outline', label: 'Write bullet-point notes of your key arguments', category: 'Preparation', mandatory: true, detail: 'Do not write a script — judges dislike reading. Bullet points keep you on track when nervous.' },
  { key: 'hp_responses', label: "Prepare responses to the other party's likely arguments", category: 'Preparation', mandatory: true, detail: 'Think through what they will say. Prepare short, factual, evidence-backed responses for each point.' },
  { key: 'hp_practice', label: 'Practice speaking your key points out loud', category: 'Preparation', mandatory: true, detail: 'Hearing yourself say it out loud is very different from reading it. Do this at least twice.' },
  { key: 'hp_court_tips', label: 'Read the Judge Insight tips', category: 'Preparation', mandatory: true, link: '/judge-insight', linkLabel: 'Court Tips' },
  { key: 'hp_childcare', label: 'Arrange childcare for the day', category: 'Logistics', mandatory: true, detail: 'Children must not be in court waiting areas. Arrange care in advance — not the morning of.' },
  { key: 'hp_route', label: 'Plan your route and parking', category: 'Logistics', mandatory: true, detail: 'Arrive at least 30 minutes early. Courthouses have security lines. Being late is not excusable.' },
  { key: 'hp_outfit', label: 'Prepare your court outfit', category: 'Logistics', mandatory: true, detail: 'Business casual minimum. Clean, pressed, professional. No hats, no graphic t-shirts.' },
  { key: 'hp_phone_off', label: 'Plan to turn your phone completely off in court', category: 'Logistics', mandatory: true, detail: 'Not silent — off. A ringing phone in a courtroom is one of the fastest ways to irritate a judge.' },
  // Optional
  { key: 'hp_legal_aid', label: 'Visit Summary Advice Counsel at the courthouse', category: 'Legal Support', mandatory: false, detail: 'Free legal advice available at most SK courthouses before your hearing. Arrive 45 min early.' },
  { key: 'hp_support', label: 'Arrange a support person to attend with you', category: 'Logistics', mandatory: false, detail: 'A trusted adult can sit in the gallery for moral support. They cannot speak for you but knowing someone is there helps.' },
  { key: 'hp_water', label: 'Bring water and a snack', category: 'Logistics', mandatory: false, detail: 'Hearings can run long. Stay hydrated and maintain your energy.' },
];

const HEARING_CATEGORY_ICONS = { 'Documents': '📁', 'Preparation': '📝', 'Logistics': '🗓️', 'Legal Support': '⚖️' };

function HearingPrepChecklist({ deadlines, userId }) {
  const [checklist, setChecklist] = useState({});
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('document_checklist').select('item_key, checked').eq('user_id', userId).like('item_key', 'hp_%');
      const map = {};
      (data || []).forEach(r => { map[r.item_key] = r.checked; });
      setChecklist(map);
      setLoaded(true);
    };
    load();
  }, [userId]);

  const toggle = async (key, val) => {
    setChecklist(prev => ({ ...prev, [key]: val }));
    const { data: existing } = await supabase.from('document_checklist').select('id').eq('user_id', userId).eq('item_key', key).single();
    if (existing) {
      await supabase.from('document_checklist').update({ checked: val, checked_at: val ? new Date().toISOString() : null }).eq('id', existing.id);
    } else {
      await supabase.from('document_checklist').insert({ user_id: userId, item_key: key, checked: val, checked_at: val ? new Date().toISOString() : null });
    }
  };

  // Find the soonest hearing deadline
  const hearingDeadline = deadlines.find(d =>
    d.event_type === 'court' || d.event_type === 'hearing' ||
    (d.title && (d.title.toLowerCase().includes('hearing') || d.title.toLowerCase().includes('trial') || d.title.toLowerCase().includes('court') || d.title.toLowerCase().includes('jcc')))
  );
  if (!hearingDeadline) return null;

  const daysLeft = Math.ceil((new Date(hearingDeadline.due_date) - new Date()) / 86400000);
  const isUrgent = daysLeft <= 7;
  const total = HEARING_PREP_ITEMS.length;
  const done = HEARING_PREP_ITEMS.filter(i => checklist[i.key]).length;
  const pct = Math.round((done / total) * 100);

  // Group items
  const grouped = {};
  HEARING_PREP_ITEMS.forEach(item => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });

  return (
    <div className={`mb-5 border-2 rounded-2xl overflow-hidden ${isUrgent ? 'border-red-400 bg-red-50' : 'border-amber-300 bg-amber-50'}`}>
      {/* Header */}
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center gap-3 p-4 text-left">
        <div className={`text-2xl flex-shrink-0`}>🏛️</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isUrgent ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'}`}>
              {isUrgent ? '🚨 Urgent' : '⏰ Upcoming'} — {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft} days`}
            </span>
          </div>
          <p className={`font-bold text-sm ${isUrgent ? 'text-red-900' : 'text-amber-900'}`}>
            Hearing Prep — {hearingDeadline.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-white/60 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? 'bg-green-500' : isUrgent ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${pct}%` }} />
            </div>
            <span className={`text-xs font-bold flex-shrink-0 ${pct === 100 ? 'text-green-700' : isUrgent ? 'text-red-700' : 'text-amber-700'}`}>{done}/{total}</span>
          </div>
        </div>
        <span className={`text-lg flex-shrink-0 ${isUrgent ? 'text-red-700' : 'text-amber-700'}`}>{open ? '▲' : '▼'}</span>
      </button>

      {open && loaded && (
        <div className="border-t border-white/40 px-4 pb-4 space-y-4 pt-3">
          {pct === 100 && (
            <div className="bg-green-100 border border-green-200 rounded-xl p-3">
              <p className="text-green-800 text-sm font-semibold">🎉 You are fully prepared. Good luck in court.</p>
            </div>
          )}
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-sm">{HEARING_CATEGORY_ICONS[category] || '📋'}</span>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">{category}</p>
              </div>
              <div className="space-y-2">
                {items.map(item => {
                  const isChecked = !!checklist[item.key];
                  return (
                    <div key={item.key} className="bg-white rounded-xl p-3 shadow-sm">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggle(item.key, !isChecked)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${isChecked ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-green-400'}`}
                        >
                          {isChecked && <span className="text-[10px] font-bold">✓</span>}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <p className={`text-sm font-medium ${isChecked ? 'line-through text-gray-400' : 'text-gray-900'}`}>{item.label}</p>
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full flex-shrink-0 ${item.mandatory ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                              {item.mandatory ? 'Required' : 'Optional'}
                            </span>
                          </div>
                          {item.detail && <p className="text-xs text-gray-500 leading-relaxed">{item.detail}</p>}
                          {item.link && (
                            <Link href={item.link} className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold text-red-600 hover:underline">
                              {item.linkLabel} →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="flex items-center gap-4 pt-1">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-600 flex-shrink-0" /><span className="text-xs text-gray-500">Required</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gray-300 flex-shrink-0" /><span className="text-xs text-gray-500">Optional</span></div>
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