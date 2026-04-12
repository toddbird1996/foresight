// Court forms v4 - restored court_forms table + SK self-help walkthrough
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Header from '../components/Header';
import PageTitle from '../components/PageTitle';

const SK_WALKTHROUGH = {
  steps: [
    {
      number: 1,
      icon: "🔍",
      title: "Choose your situation",
      description: "Before calling, identify which type of kit applies to you.",
      details: [
        { label: "Parenting & Support Kit", desc: "Not married, or married but don't need a divorce. Need parenting time, decision-making, or child/spousal support orders." },
        { label: "Divorce Kit", desc: "Were legally married and need a formal divorce. Also covers parenting, support, and property." },
        { label: "Variation Kit", desc: "Already have a court order and need to change it — e.g. changing child support or parenting time." },
        { label: "Not sure?", desc: "Call the Family Law Information Centre and describe your situation. They'll tell you which kit is right — for free." },
      ]
    },
    {
      number: 2,
      icon: "📞",
      title: "Request your kit",
      description: "Call or email the Family Law Information Centre. Kits are free.",
      checklist: [
        "Have your full name, address, and phone number ready",
        "Know whether you were married or common-law",
        "Know the names and birth dates of any children",
        "Know what you are asking the court for (parenting, support, divorce, property)",
        "Know if the other person lives in Saskatchewan or elsewhere",
      ],
      tip: "Kits arrive by mail (paper) or email (fillable PDF). Ask for the fillable PDF — it is easier to correct mistakes."
    },
    {
      number: 3,
      icon: "📬",
      title: "Review your kit before filling anything out",
      description: "Read the instruction booklet from cover to cover first.",
      checklist: [
        "Read all instructions before touching a single form",
        "List the forms included and understand what each one does",
        "Gather what you need: tax returns, pay stubs, birth certificates, marriage certificate",
        "If paper kit: photocopy all blank forms so you can start over if needed",
      ],
      tip: "Filling forms in the wrong order or skipping one can cause the court to reject your filing. Follow the order in the instructions exactly."
    },
    {
      number: 4,
      icon: "👨‍👩‍👧",
      title: "Complete the For Kids' Sake course (if children involved)",
      description: "Mandatory for separating parents in Saskatchewan before filing.",
      checklist: [
        "Register at saskatchewanforkidssake.ca or call 1-888-425-4737",
        "Cost is approximately $25",
        "You receive a certificate on completion — keep it",
        "The other parent must complete it separately",
        "You must attach your certificate to your court documents",
      ]
    },
    {
      number: 5,
      icon: "✏️",
      title: "Fill out your forms",
      description: "Work through each form in the order listed in your instruction booklet.",
      checklist: [
        "Print clearly in black ink, or type in the fillable PDF",
        "Use your full legal name exactly as it appears on your ID",
        "Answer every question — write N/A if something doesn't apply",
        "Double-check all dates, dollar amounts, and names",
        "Do not leave any section completely blank",
      ],
      tip: "Stuck on a question? Attend a free Family Law Help Session in Regina, Saskatoon, Prince Albert, Moose Jaw, Battleford, or Meadow Lake. No appointment needed."
    },
    {
      number: 6,
      icon: "⚖️",
      title: "Swear your affidavit(s) before a Commissioner for Oaths",
      description: "Any affidavit in your kit must be signed in front of a Commissioner — not just on your own.",
      checklist: [
        "Do NOT sign the affidavit before you are in front of the Commissioner",
        "Commissioners are at most law offices (usually free or low cost for this)",
        "Banks and credit unions often offer this service too",
        "Bring valid government photo ID",
        "The Commissioner watches you sign and then stamps the document",
      ],
      tip: "Call Legal Aid Saskatchewan (1-800-667-3764) if you can't afford a law office — they can direct you to free options."
    },
    {
      number: 7,
      icon: "🏛️",
      title: "File at the Court of King's Bench",
      description: "Bring 3 copies of all forms to the nearest court registry.",
      details: [
        { label: "Regina", desc: "2425 Victoria Avenue — 306-787-5510" },
        { label: "Saskatoon", desc: "520 Spadina Crescent East — 306-933-5155" },
        { label: "Prince Albert", desc: "105 – 19th Street East — 306-953-2454" },
        { label: "Filing fee", desc: "~$300 for a new application. Fee waivers available if you can't afford it — ask at the counter." },
      ],
      tip: "3 copies: one for the court, one to serve on the other party, one to keep for yourself."
    },
    {
      number: 8,
      icon: "📨",
      title: "Serve the other party",
      description: "You cannot serve the documents yourself — an adult third party must do it.",
      checklist: [
        "Ask an adult friend or family member (not involved in the case) to hand the documents directly to the respondent",
        "Or hire a process server (~$100–200)",
        "The server completes and swears an Affidavit of Service (included in your kit)",
        "File the completed Affidavit of Service with the court",
        "The respondent has 30 days to respond (60 days if outside Saskatchewan)",
      ]
    },
    {
      number: 9,
      icon: "⏳",
      title: "What happens next",
      description: "After serving the other party, the next steps depend on whether they respond.",
      details: [
        { label: "If they agree on everything", desc: "Prepare a Consent Order — both parties sign it and a judge approves it without a hearing." },
        { label: "If they disagree or don't respond", desc: "The court schedules a Judicial Case Conference (JCC) — a meeting with a judge to narrow issues." },
        { label: "If no response after 30 days", desc: "You can apply to proceed without them (default order)." },
      ],
      tip: "Most cases settle before trial. Use the free form wizard at familylaw.plea.org for help preparing additional documents as your case progresses."
    }
  ]
};

export default function CourtFormsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [jurisdictions, setJurisdictions] = useState([]);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState(null);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedStep, setExpandedStep] = useState(null);
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      setUser(user);
      await fetchJurisdictions();
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedJurisdiction) {
      fetchForms(selectedJurisdiction.name);
      setSelectedCategory("all");
      setExpandedStep(null);
      setShowWalkthrough(false);
    }
  }, [selectedJurisdiction]);

  const fetchJurisdictions = async () => {
    const { data, error } = await supabase.from("jurisdictions").select("*").order("display_order");
    if (error) { console.error(error); return; }
    setJurisdictions(data || []);
    const sk = data?.find(j => j.id === 'saskatchewan');
    if (sk) setSelectedJurisdiction(sk);
    else if (data?.length > 0) setSelectedJurisdiction(data[0]);
  };

  const fetchForms = async (jurisdictionName) => {
    const { data, error } = await supabase
      .from("court_forms")
      .select("*")
      .eq("state_province", jurisdictionName)
      .order("filing_order", { ascending: true });
    if (error) console.error(error);
    setForms(data || []);
  };

  const categories = ["all", ...new Set(forms.map(f => f.filing_procedure).filter(Boolean))];
  const filteredForms = selectedCategory === "all" ? forms : forms.filter(f => f.filing_procedure === selectedCategory);
  const canadianJurisdictions = jurisdictions.filter(j => j.country === 'Canada');
  const usJurisdictions = jurisdictions.filter(j => j.country === 'USA');
  const isSK = selectedJurisdiction?.id === 'saskatchewan';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading court forms...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <PageTitle title="Court Forms" subtitle="Download official forms by province" icon="📄" />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-5">

        {/* Jurisdiction selector */}
        <select
          value={selectedJurisdiction?.id || ''}
          onChange={e => { const j = jurisdictions.find(j => j.id === e.target.value); if (j) setSelectedJurisdiction(j); }}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-red-400"
        >
          <optgroup label="🇨🇦 Canada">
            {canadianJurisdictions.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
          </optgroup>
          {usJurisdictions.length > 0 && (
            <optgroup label="🇺🇸 United States">
              {usJurisdictions.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
            </optgroup>
          )}
        </select>

        {/* SK self-help kit banner */}
        {isSK && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-amber-900 text-sm">📦 Saskatchewan Self-Help Kits Available</p>
                <p className="text-amber-700 text-xs mt-1">
                  The forms below are individual court documents. Saskatchewan also offers complete self-help kits
                  with all forms + instructions bundled together — recommended for self-represented litigants.
                </p>
                <div className="flex flex-wrap gap-3 mt-2 text-xs">
                  <span className="text-amber-800 font-medium">📞 1-888-218-2822</span>
                  <span className="text-amber-800 font-medium">✉️ familylaw@gov.sk.ca</span>
                </div>
              </div>
              <button
                onClick={() => setShowWalkthrough(!showWalkthrough)}
                className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0"
              >
                {showWalkthrough ? 'Hide Guide' : 'How to Use a Kit →'}
              </button>
            </div>
          </div>
        )}

        {/* SK self-help walkthrough */}
        {isSK && showWalkthrough && (
          <div className="space-y-3">
            <h2 className="font-semibold text-gray-800">Step-by-Step: Using a Saskatchewan Self-Help Kit</h2>
            {SK_WALKTHROUGH.steps.map((step) => (
              <div key={step.number} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedStep(expandedStep === step.number ? null : step.number)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-red-700 font-bold text-xs">{step.number}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <span>{step.icon}</span>
                    <span className="font-semibold text-gray-900 text-sm">{step.title}</span>
                  </div>
                  <span className="text-gray-400 text-sm">{expandedStep === step.number ? '▲' : '▼'}</span>
                </button>

                {expandedStep === step.number && (
                  <div className="px-4 pb-4 pt-1 border-t border-gray-100 space-y-3">
                    <p className="text-gray-700 text-sm">{step.description}</p>

                    {step.checklist && (
                      <ul className="space-y-1.5">
                        {step.checklist.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {step.details && (
                      <div className="space-y-2">
                        {step.details.map((d, i) => (
                          <div key={i} className="bg-gray-50 rounded-lg p-3">
                            <p className="font-semibold text-gray-800 text-xs">{d.label}</p>
                            <p className="text-gray-600 text-xs mt-0.5">{d.desc}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {step.tip && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-2">
                        <span className="text-blue-500 flex-shrink-0 text-sm">💡</span>
                        <p className="text-blue-800 text-xs">{step.tip}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Resources */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
              <p className="font-semibold text-gray-800 text-sm">🔗 Saskatchewan Resources</p>
              {[
                { label: "Form Wizard (free online)", url: "https://familylaw.plea.org/", desc: "Guided tool to complete SK family law forms" },
                { label: "Self-Help Kit Request Page", url: "https://www.saskatchewan.ca/residents/births-deaths-marriages-and-divorces/separation-or-divorce/represent-yourself-in-family-court", desc: "Official page with kit information and help session schedule" },
                { label: "Legal Aid Saskatchewan", url: "https://legalaid.sk.ca/", desc: "Free legal help if you qualify — 1-800-667-3764" },
                { label: "For Kids' Sake Course", url: "https://www.saskatchewanforkidssake.ca/", desc: "Mandatory parenting course for separating parents with children" },
              ].map((r, i) => (
                <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="block">
                  <p className="text-red-600 text-sm font-medium">{r.label} →</p>
                  <p className="text-gray-500 text-xs">{r.desc}</p>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Forms list */}
        {forms.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <p className="text-gray-600 mb-2">No forms available for {selectedJurisdiction?.name} yet.</p>
            <p className="text-sm text-gray-400">Check back soon or contact your provincial court directly.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">
                📥 {selectedJurisdiction?.name} Forms
              </h2>
              <span className="text-xs text-gray-400">{filteredForms.length} form{filteredForms.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Category filter */}
            {categories.length > 2 && (
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      selectedCategory === cat
                        ? 'bg-red-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-red-300'
                    }`}
                  >
                    {cat === "all" ? "All" : cat}
                  </button>
                ))}
              </div>
            )}

            {filteredForms.map((form) => (
              <div key={form.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-red-600 font-mono text-xs font-medium">{form.court_name}</span>
                      {form.filing_procedure && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
                          {form.filing_procedure}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{form.form_name}</h3>
                    <p className="text-gray-600 text-sm">{form.form_description}</p>
                  </div>

                  {form.form_url && form.downloadable && (
                    <a
                      href={form.form_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex-shrink-0"
                    >
                      📄 Download
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Help card */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="font-semibold text-red-800 mb-1">💡 Need Help With a Form?</h3>
          <p className="text-sm text-red-700">
            Ask the AI assistant to explain what a specific form is for, what information you need, or what happens after you file it.
          </p>
        </div>

      </main>
    </div>
  );
}
