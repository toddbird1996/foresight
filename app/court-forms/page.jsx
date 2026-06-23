// Court forms v5 - downloads + full self-help kit walkthroughs blended
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Header from '../components/Header';
import PageTitle from '../components/PageTitle';

// ─── Self-Help Kit data by jurisdiction ───────────────────────────────────────
const SELF_HELP_KITS = {
  saskatchewan: {
    title: "Saskatchewan Self-Help Kits",
    colour: "amber",
    intro: "Saskatchewan family law forms are bundled into self-help kits — complete packages with every form you need plus step-by-step written instructions. The individual forms above are supplementary; the kit is the recommended starting point for self-represented litigants.",
    contact: {
      label: "Family Law Information Centre",
      phone: "1-888-218-2822",
      localPhone: "306-787-5837",
      email: "familylaw@gov.sk.ca",
      hours: "Mon – Fri, 8:00 AM – 5:00 PM CST",
    },
    kits: [
      { name: "Parenting & Support Kit", desc: "Not married, or married but no divorce needed. Covers parenting time, decision-making responsibility, and child/spousal support." },
      { name: "Divorce Kit", desc: "Legally married and need a formal divorce. Also covers parenting, support, and property division." },
      { name: "Variation Kit", desc: "Already have a court order and need to change it — e.g. changing child support amounts or parenting time." },
    ],
    steps: [
      {
        number: 1, icon: "🔍", title: "Choose your kit",
        description: "Before calling, identify which type applies to your situation (see kit types above). Not sure? Just call — they'll tell you for free.",
        checklist: [
          "Were you legally married? → Divorce Kit",
          "Common-law or no divorce needed? → Parenting & Support Kit",
          "Already have an order you need to change? → Variation Kit",
        ],
      },
      {
        number: 2, icon: "📞", title: "Request your kit (free)",
        description: "Call or email the Family Law Information Centre. Have this ready:",
        checklist: [
          "Your full name, address, and phone number",
          "Whether you were married or common-law",
          "Names and birth dates of any children",
          "What you're asking the court for",
          "Whether the other person lives in Saskatchewan or elsewhere",
        ],
        tip: "Ask for the fillable PDF version — easier to correct mistakes than paper.",
      },
      {
        number: 3, icon: "📬", title: "Review before you fill anything out",
        description: "Read the full instruction booklet first — don't touch a form until you've read it all.",
        checklist: [
          "Read all instructions cover to cover",
          "List the forms included and what each one does",
          "Gather documents: tax returns, pay stubs, birth certificates, marriage certificate",
          "If paper kit: photocopy all blank forms before you start",
        ],
        tip: "Filing forms out of order or skipping one can get your application rejected.",
      },
      {
        number: 4, icon: "👨‍👩‍👧", title: "Complete For Kids' Sake (if children involved)",
        description: "Mandatory parenting course required before filing — both parents separately.",
        checklist: [
          "Register at saskatchewanforkidssake.ca or call 1-888-425-4737",
          "Cost is approximately $25",
          "Keep your certificate — it must be attached to your court documents",
          "The other parent completes it separately",
        ],
      },
      {
        number: 5, icon: "✏️", title: "Fill out your forms",
        description: "Work through each form in the exact order listed in the instructions.",
        checklist: [
          "Use your legal name exactly as it appears on ID",
          "Answer every question — write N/A if not applicable",
          "Double-check all dates, dollar amounts, and names",
          "Never leave a section completely blank",
        ],
        tip: "Stuck? Attend a free Family Law Help Session in Regina, Saskatoon, Prince Albert, Moose Jaw, Battleford, or Meadow Lake. No appointment needed.",
      },
      {
        number: 6, icon: "⚖️", title: "Swear your affidavit(s)",
        description: "Affidavits must be signed in front of a Commissioner for Oaths — not just on your own.",
        checklist: [
          "Do NOT sign before you are in front of the Commissioner",
          "Available at most law offices (usually free or low cost)",
          "Also at banks and credit unions",
          "Bring valid government photo ID",
        ],
        tip: "Call Legal Aid Saskatchewan (1-800-667-3764) if you can't afford a law office.",
      },
      {
        number: 7, icon: "🏛️", title: "File at the Court of King's Bench",
        description: "Bring 3 copies of all your forms to the nearest registry.",
        details: [
          { label: "Regina", desc: "2425 Victoria Avenue — 306-787-5510" },
          { label: "Saskatoon", desc: "520 Spadina Crescent East — 306-933-5155" },
          { label: "Prince Albert", desc: "105 – 19th Street East — 306-953-2454" },
          { label: "Filing fee", desc: "~$300 for a new application. Fee waivers available — ask at the counter." },
        ],
        tip: "3 copies: one for court, one to serve on the other party, one for yourself.",
      },
      {
        number: 8, icon: "📨", title: "Serve the other party",
        description: "You cannot serve documents yourself — an adult third party must do it.",
        checklist: [
          "Adult friend/family member (not involved in the case) hands documents directly to the respondent",
          "Or hire a process server (~$100–200)",
          "Server completes and swears the Affidavit of Service (included in your kit)",
          "File the completed Affidavit of Service with the court",
          "Respondent has 30 days to respond (60 days if outside SK)",
        ],
      },
      {
        number: 9, icon: "⏳", title: "What happens next",
        description: "After serving, next steps depend on whether they respond.",
        details: [
          { label: "Both agree", desc: "Prepare a Consent Order — both sign, a judge approves without a hearing." },
          { label: "They disagree or don't respond", desc: "Court schedules a Judicial Case Conference (JCC) with a judge." },
          { label: "No response after 30 days", desc: "You can apply to proceed without them (default order)." },
        ],
        tip: "Use the free form wizard at familylaw.plea.org for help as your case progresses.",
      },
    ],
    resources: [
      { label: "Form Wizard (free online)", url: "https://familylaw.plea.org/", desc: "Guided tool to complete SK family law forms step by step" },
      { label: "Help Sessions (no appointment)", url: "https://www.saskatchewan.ca/residents/births-deaths-marriages-and-divorces/separation-or-divorce/represent-yourself-in-family-court", desc: "In-person help in Regina, Saskatoon, PA, Moose Jaw, Battleford, Meadow Lake" },
      { label: "For Kids' Sake Course", url: "https://www.saskatchewanforkidssake.ca/", desc: "Mandatory parenting course — register online or call 1-888-425-4737" },
      { label: "Legal Aid Saskatchewan", url: "https://legalaid.sk.ca/", desc: "Free legal help if you qualify financially — 1-800-667-3764" },
      { label: "Family Law Saskatchewan", url: "https://familylaw.plea.org/", desc: "Comprehensive plain-language family law information" },
    ],
  },

  manitoba: {
    title: "Manitoba Family Law Guide",
    colour: "blue",
    intro: "Manitoba's Court of King's Bench (Family Division) handles divorce, property, and most family law matters. The provincial government web server (web2.gov.mb.ca) can be slow or temporarily unavailable — if a direct form link doesn't load, visit the court registry in person.",
    contact: {
      label: "Winnipeg Court of King's Bench Registry",
      phone: "204-945-0332",
      email: "courts@gov.mb.ca",
      hours: "Mon – Fri, 8:30 AM – 4:30 PM CST",
    },
    kits: [
      { name: "Court of King's Bench (Family Division)", desc: "Handles divorce, division of property, custody, and support. Uses forms numbered 70A, 70B, 70D, etc." },
      { name: "Provincial Court", desc: "Handles parenting and support applications where divorce is not involved. Uses different forms." },
    ],
    steps: [
      {
        number: 1, icon: "🔍", title: "Identify the right court",
        description: "Two courts handle family matters in Manitoba.",
        details: [
          { label: "Court of King's Bench (Family Division)", desc: "Divorce, property division, and most family law applications. Forms: 70A, 70B, 70D, 70K." },
          { label: "Provincial Court", desc: "Parenting and support where divorce isn't needed. Different forms — ask the registry which to use." },
        ],
      },
      {
        number: 2, icon: "📋", title: "Gather your main forms",
        description: "For a King's Bench family application you will typically need:",
        checklist: [
          "Form 70A — Petition (starts your case)",
          "Form 70D — Financial Statement (income, expenses, assets, debts)",
          "Form 70B — Answer (if responding to someone else's petition)",
          "Form 70K — Affidavit of Service (proves you served the other party)",
          "Marriage certificate (if applying for divorce)",
        ],
        tip: "Forms available at the court registry or at web2.gov.mb.ca/laws/rules/regforms_e.php when the server is up.",
      },
      {
        number: 3, icon: "✏️", title: "Complete and swear your documents",
        description: "Fill out all forms carefully. Have affidavits sworn before a Commissioner for Oaths before filing.",
      },
      {
        number: 4, icon: "🏛️", title: "File at the Court of King's Bench",
        description: "File your completed documents at the nearest registry.",
        details: [
          { label: "Winnipeg", desc: "408 York Avenue — 204-945-0332" },
          { label: "Brandon", desc: "1104 Princess Avenue — 204-726-6466" },
          { label: "Thompson", desc: "113 Commercial Place — 204-677-6788" },
        ],
      },
    ],
    resources: [
      { label: "Manitoba Family Law Hub", url: "https://www.gov.mb.ca/familylaw/", desc: "Official family law information and guidance" },
      { label: "King's Bench Family Forms", url: "https://web2.gov.mb.ca/laws/rules/regforms_e.php", desc: "Official forms index (may be slow)" },
      { label: "Legal Aid Manitoba", url: "https://www.legalaid.mb.ca/", desc: "Free legal help if you qualify — 204-985-8500" },
    ],
  },
};

// ─── Category badge colours ────────────────────────────────────────────────────
const catColour = (cat) => ({
  Filing: "bg-blue-100 text-blue-700",
  Financial: "bg-green-100 text-green-700",
  Service: "bg-yellow-100 text-yellow-700",
  Motions: "bg-orange-100 text-orange-700",
  Parenting: "bg-pink-100 text-pink-700",
  JCC: "bg-purple-100 text-purple-700",
  Divorce: "bg-red-100 text-red-700",
  Orders: "bg-teal-100 text-teal-700",
}[cat] || "bg-gray-100 text-gray-600");

// ─── Kit Step component ────────────────────────────────────────────────────────
function KitStep({ step, expanded, onToggle }) {
  const hasContent = step.checklist || step.details || step.tip;
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={hasContent ? onToggle : undefined}
        className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${hasContent ? "hover:bg-gray-50 cursor-pointer" : "cursor-default"}`}
      >
        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-red-700 font-bold text-xs">{step.number}</span>
        </div>
        <div className="flex items-center gap-2 flex-1">
          <span className="text-base">{step.icon}</span>
          <span className="font-semibold text-gray-900 text-sm">{step.title}</span>
        </div>
        {hasContent && (
          <span className="text-gray-400 text-sm">{expanded ? "▲" : "▼"}</span>
        )}
      </button>

      {expanded && hasContent && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-100 space-y-3">
          {step.description && (
            <p className="text-gray-700 text-sm leading-relaxed">{step.description}</p>
          )}
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
              <span className="text-blue-500 flex-shrink-0">💡</span>
              <p className="text-blue-800 text-xs">{step.tip}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
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
    const sk = data?.find(j => j.id === "saskatchewan");
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

  const kit = SELF_HELP_KITS[selectedJurisdiction?.id];
  const categories = ["all", ...new Set(forms.map(f => f.filing_procedure).filter(Boolean))];
  const filteredForms = selectedCategory === "all" ? forms : forms.filter(f => f.filing_procedure === selectedCategory);
  const canadianJurisdictions = jurisdictions.filter(j => j.country === "Canada");
  const usJurisdictions = jurisdictions.filter(j => j.country === "USA");

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading court forms...</p>
      </div>
    );
  }

  const kitBg = kit?.colour === "amber" ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-200";
  const kitTitle = kit?.colour === "amber" ? "text-amber-900" : "text-blue-900";
  const kitText = kit?.colour === "amber" ? "text-amber-700" : "text-blue-700";
  const kitBadgeBg = kit?.colour === "amber" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800";
  const kitBtnBg = kit?.colour === "amber" ? "bg-amber-600 hover:bg-amber-700" : "bg-blue-600 hover:bg-blue-700";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <PageTitle title="Court Forms" subtitle="Download official forms and step-by-step guides" icon="📄" />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Jurisdiction selector */}
        <select
          value={selectedJurisdiction?.id || ""}
          onChange={e => {
            const j = jurisdictions.find(j => j.id === e.target.value);
            if (j) setSelectedJurisdiction(j);
          }}
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

        {/* ── Downloadable forms ─────────────────────────────────────────────── */}
        {forms.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">📥 Download Forms — {selectedJurisdiction?.name}</h2>
              <span className="text-xs text-gray-400">{filteredForms.length} form{filteredForms.length !== 1 ? "s" : ""}</span>
            </div>

            {filteredForms.map(form => (
              <div key={form.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-red-600 font-mono text-xs font-medium">{form.court_name}</span>
                      {form.filing_procedure && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catColour(form.filing_procedure)}`}>
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
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex-shrink-0 whitespace-nowrap"
                    >
                      {form.form_url?.includes('#/categories') ? '🔗 View on Publications SK'
                        : form.form_url?.includes('gov.bc.ca') || form.form_url?.includes('provincialcourt.bc.ca') ? '🔗 BC Forms Directory'
                        : '📄 Download'}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {forms.length === 0 && !kit && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <p className="text-gray-600 mb-1">No forms available for {selectedJurisdiction?.name} yet.</p>
            <p className="text-sm text-gray-400">Check back soon or contact your provincial court directly.</p>
          </div>
        )}

        {/* Suggest a missing form */}
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-700">Can't find the form you need?</p>
            <p className="text-xs text-gray-500 mt-0.5">Suggest it and we'll add it to Foresight.</p>
          </div>
          <a
            href={`mailto:Foresightcustodysupport@gmail.com?subject=Form Request — ${selectedJurisdiction?.name || 'Canada'}&body=Hi,%0A%0AI'm looking for the following court form:%0A%0AForm name/number: %0AJurisdiction: ${selectedJurisdiction?.name || ''}%0APurpose: %0A%0APlease add it to Foresight. Thank you.`}
            className="flex-shrink-0 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold whitespace-nowrap"
          >
            📩 Suggest a Form
          </a>
        </div>

        {/* ── Self-Help Kit section ──────────────────────────────────────────── */}
        {kit && (
          <div className="space-y-4">

            {/* Kit intro banner */}
            <div className={`border rounded-xl p-5 ${kitBg}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <h2 className={`font-bold text-lg ${kitTitle}`}>📦 {kit.title}</h2>
                <button
                  onClick={() => setShowWalkthrough(v => !v)}
                  className={`text-white px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 ${kitBtnBg}`}
                >
                  {showWalkthrough ? "Hide Guide ▲" : "How to Use a Kit ▼"}
                </button>
              </div>
              <p className={`text-sm leading-relaxed mb-4 ${kitText}`}>{kit.intro}</p>

              {/* Kit types */}
              <div className="grid gap-2 sm:grid-cols-3 mb-4">
                {kit.kits.map((k, i) => (
                  <div key={i} className="bg-white bg-opacity-70 rounded-lg p-3 border border-white">
                    <p className={`font-semibold text-xs mb-1 ${kitTitle}`}>{k.name}</p>
                    <p className="text-xs text-gray-600">{k.desc}</p>
                  </div>
                ))}
              </div>

              {/* Contact card */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 text-sm space-y-1">
                <p className="font-semibold text-gray-800 mb-2">📞 {kit.contact.label}</p>
                <p className="text-gray-700">
                  Toll Free: <a href={`tel:${kit.contact.phone}`} className="text-red-600 font-medium">{kit.contact.phone}</a>
                </p>
                {kit.contact.localPhone && (
                  <p className="text-gray-700">
                    Local: <a href={`tel:${kit.contact.localPhone}`} className="text-red-600 font-medium">{kit.contact.localPhone}</a>
                  </p>
                )}
                <p className="text-gray-700">
                  Email: <a href={`mailto:${kit.contact.email}`} className="text-red-600 font-medium">{kit.contact.email}</a>
                </p>
                {kit.contact.hours && (
                  <p className="text-gray-500 text-xs mt-1">{kit.contact.hours}</p>
                )}
              </div>
            </div>

            {/* Step-by-step walkthrough (expandable) */}
            {showWalkthrough && kit.steps && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800">Step-by-Step Walkthrough</h3>
                {kit.steps.map(step => (
                  <KitStep
                    key={step.number}
                    step={step}
                    expanded={expandedStep === step.number}
                    onToggle={() => setExpandedStep(expandedStep === step.number ? null : step.number)}
                  />
                ))}
              </div>
            )}

            {/* Resources */}
            {kit.resources && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-800">🔗 Resources</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {kit.resources.map((r, i) => (
                    <a
                      key={i}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white border border-gray-200 rounded-xl p-3 hover:border-red-300 transition-colors block"
                    >
                      <p className="font-semibold text-red-600 text-sm">{r.label} →</p>
                      <p className="text-gray-500 text-xs mt-0.5">{r.desc}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Help card */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="font-semibold text-red-800 mb-1">💡 Need Help With a Form?</h3>
          <p className="text-sm text-red-700">
            Ask the AI assistant to explain what a specific form is for, what information you need to fill it out, or what happens after you file it.
          </p>
        </div>

      </main>
    </div>
  );
}