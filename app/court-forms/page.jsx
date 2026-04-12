// Court forms v3 - real forms table + self-help kit walkthroughs
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Header from '../components/Header';
import PageTitle from '../components/PageTitle';

// Self-help kit walkthroughs by jurisdiction
const SELF_HELP_KITS = {
  saskatchewan: {
    title: "Saskatchewan Family Law Self-Help Kit",
    intro: "Saskatchewan family law forms are not available for individual download online. Instead, the Family Law Information Centre provides complete self-help kits — packages of all the forms you need, with step-by-step instructions. Here is how to get your kit and what to do with it.",
    contact: {
      phone: "1-888-218-2822",
      localPhone: "306-787-5837",
      email: "familylaw@gov.sk.ca",
      hours: "Monday to Friday, 8:00 AM – 5:00 PM CST"
    },
    steps: [
      {
        number: 1,
        title: "Choose your situation",
        icon: "🔍",
        description: "Before contacting the Family Law Information Centre, identify which type of kit applies to your situation.",
        details: [
          { label: "Parenting & Support Kit", desc: "If you and your ex are not married, or if you don't need a divorce, but need parenting time, decision-making, or child/spousal support orders." },
          { label: "Divorce Kit", desc: "If you were legally married and need a divorce. This also covers parenting, support, and property division." },
          { label: "Variation Kit", desc: "If you already have a court order and need to change it — for example, changing child support or parenting arrangements." },
          { label: "Not sure?", desc: "Call or email the Centre and describe your situation. They will tell you which kit is right for you at no cost." }
        ]
      },
      {
        number: 2,
        title: "Contact the Family Law Information Centre",
        icon: "📞",
        description: "Call or email to request your kit. It is free. Have this information ready when you call:",
        checklist: [
          "Your full name and address",
          "Whether you were married or in a common-law relationship",
          "Whether children are involved (names and dates of birth)",
          "What you are asking the court to decide (parenting, support, property, divorce)",
          "Whether the other person lives in Saskatchewan or elsewhere"
        ],
        tip: "You can also request the kit by email at familylaw@gov.sk.ca. Kits are available by mail (paper) or by email (fillable PDF)."
      },
      {
        number: 3,
        title: "Receive and review your kit",
        icon: "📬",
        description: "Your kit will arrive by mail or email. It includes all the forms you need plus written instructions. Before filling anything out:",
        checklist: [
          "Read the instruction booklet from start to finish",
          "Make a list of the forms included and their purpose",
          "Gather the documents you will need: tax returns, pay stubs, birth certificates, marriage certificate",
          "Note any deadlines mentioned in the instructions"
        ],
        tip: "If you received a paper kit, make photocopies of all blank forms before you start writing. This way you can start over if you make a mistake."
      },
      {
        number: 4,
        title: "Complete the For Kids' Sake course (if children are involved)",
        icon: "👨‍👩‍👧",
        description: "If your case involves children, Saskatchewan courts require both parents to complete the For Kids' Sake parenting course before filing.",
        checklist: [
          "Register at saskatchewanforkidssake.ca or call 1-888-425-4737",
          "The course costs approximately $25",
          "You will receive a certificate when you complete it",
          "Keep the certificate — you must attach it to your court documents"
        ],
        tip: "The other parent must also complete this course separately. You do not attend together."
      },
      {
        number: 5,
        title: "Fill out your forms",
        icon: "✏️",
        description: "Work through each form in the order listed in your instruction booklet. Take your time — accuracy matters.",
        checklist: [
          "Print clearly in black ink if completing by hand, or type if using fillable PDF",
          "Answer every question — write N/A if something does not apply",
          "Do not leave any section blank",
          "Use your legal name exactly as it appears on your ID",
          "Double-check all dates, dollar amounts, and names for accuracy"
        ],
        tip: "If you get stuck on a specific question, you can attend a free Family Law Help Session in Regina, Saskatoon, Prince Albert, Moose Jaw, Battleford, or Meadow Lake. No appointment needed."
      },
      {
        number: 6,
        title: "Swear your affidavit(s) before a Commissioner for Oaths",
        icon: "⚖️",
        description: "Most kits include one or more affidavits — sworn statements of fact. These must be signed in front of a Commissioner for Oaths, not just on your own.",
        checklist: [
          "Do NOT sign the affidavit before you are in front of the Commissioner",
          "Commissioners are available at most law offices (usually free or low cost)",
          "Banks, credit unions, and some pharmacies also offer this service",
          "Bring valid photo ID when you go",
          "The Commissioner will watch you sign and then stamp the document"
        ],
        tip: "If you cannot afford a lawyer's office, call the Family Law Information Centre — they can direct you to free or low-cost Commissioner services."
      },
      {
        number: 7,
        title: "File your documents at the Court of King's Bench",
        icon: "🏛️",
        description: "Take your completed, sworn forms to the nearest Court of King's Bench registry.",
        details: [
          { label: "Regina", desc: "2425 Victoria Avenue, Regina, SK S4P 3V7 — Phone: 306-787-5510" },
          { label: "Saskatoon", desc: "520 Spadina Crescent East, Saskatoon, SK S7K 3G7 — Phone: 306-933-5155" },
          { label: "Prince Albert", desc: "105 – 19th Street East, Prince Albert, SK S6V 1E8" },
          { label: "Filing fee", desc: "Approximately $300 for a new application. Fee waivers are available if you cannot afford the fee — ask at the counter." }
        ],
        tip: "Bring 3 copies of all your forms: one for the court, one to serve on the other party, and one for yourself."
      },
      {
        number: 8,
        title: "Serve the other party",
        icon: "📨",
        description: "After filing, you must deliver a copy of your documents to the other person (the respondent). You cannot serve them yourself.",
        checklist: [
          "Ask an adult friend, family member (not a party to the case), or process server to deliver the documents",
          "Service must be done in person — handing the documents directly to the respondent",
          "The server must complete an Affidavit of Service (included in your kit) and swear it before a Commissioner for Oaths",
          "File the completed Affidavit of Service with the court",
          "The respondent has 30 days to file a response (60 days if outside Saskatchewan)"
        ],
        tip: "Professional process servers typically charge $100–$200 and can be found in the Yellow Pages or online."
      },
      {
        number: 9,
        title: "Wait for the response and next steps",
        icon: "⏳",
        description: "After serving the other party, the next steps depend on whether they respond and whether you can reach an agreement.",
        details: [
          { label: "If they agree", desc: "You can prepare a Consent Order, which both parties sign. A judge then approves it without a hearing." },
          { label: "If they disagree or do not respond", desc: "The court will schedule a Judicial Case Conference (JCC) — a meeting with a judge to try to resolve issues." },
          { label: "Form wizard help", desc: "Use the free online form wizard at familylaw.plea.org to help prepare additional documents as your case progresses." }
        ],
        tip: "Most cases settle before trial. Focus on what is best for your children and stay open to negotiation."
      }
    ],
    resources: [
      { label: "Form Wizard (online)", url: "https://familylaw.plea.org/", desc: "Free tool to help complete SK family law forms" },
      { label: "Help Sessions (no appointment)", url: "https://www.saskatchewan.ca/residents/births-deaths-marriages-and-divorces/separation-or-divorce/represent-yourself-in-family-court", desc: "In-person help in Regina, Saskatoon, PA, Moose Jaw, Battleford, Meadow Lake" },
      { label: "Legal Aid Saskatchewan", url: "https://legalaid.sk.ca/", desc: "Free legal help if you qualify financially — 1-800-667-3764" },
      { label: "Family Law Saskatchewan", url: "https://familylaw.plea.org/", desc: "Comprehensive family law information for Saskatchewan" }
    ]
  },
  manitoba: {
    title: "Manitoba Family Law Forms Guide",
    intro: "Manitoba Court of King's Bench family law forms are available through the court registry. The government's web server is occasionally slow — if a direct link does not load, visit the court registry in person or use the Family Law Hub for guidance.",
    contact: {
      phone: "204-945-0332",
      email: "courts@gov.mb.ca",
      hours: "Monday to Friday, 8:30 AM – 4:30 PM CST"
    },
    steps: [
      {
        number: 1,
        title: "Identify the court that handles your case",
        icon: "🔍",
        description: "Manitoba has two courts that handle family law matters.",
        details: [
          { label: "Court of King's Bench (Family Division)", desc: "Handles divorce, division of property, and most family law applications. Forms are numbered 70A, 70B, 70D, etc." },
          { label: "Provincial Court", desc: "Handles applications for parenting, support, and protection orders where divorce is not involved. Uses different forms." }
        ]
      },
      {
        number: 2,
        title: "Gather the main forms",
        icon: "📋",
        description: "For a King's Bench family application you will typically need:",
        checklist: [
          "Form 70A — Petition (starts your case)",
          "Form 70D — Financial Statement (income, expenses, assets, debts)",
          "Form 70B — Answer (if you are responding to someone else's petition)",
          "Form 70K — Affidavit of Service (proves you served the other party)",
          "Marriage certificate (if applying for divorce)"
        ],
        tip: "Forms are available at the court registry or online at web2.gov.mb.ca/laws/rules/regforms_e.php when the server is available."
      },
      {
        number: 3,
        title: "Complete and swear your documents",
        icon: "✏️",
        description: "Fill out all forms carefully and have your affidavits sworn before a Commissioner for Oaths before filing."
      },
      {
        number: 4,
        title: "File at the Court of King's Bench registry",
        icon: "🏛️",
        description: "File your completed documents at the nearest Court of King's Bench registry.",
        details: [
          { label: "Winnipeg", desc: "408 York Avenue, Winnipeg, MB R3C 0P9 — Phone: 204-945-0332" },
          { label: "Brandon", desc: "1104 Princess Avenue, Brandon, MB R7A 0P9 — Phone: 204-726-6466" }
        ]
      }
    ],
    resources: [
      { label: "Manitoba Family Law Hub", url: "https://www.gov.mb.ca/familylaw/", desc: "Official Manitoba family law information and guidance" },
      { label: "King's Bench Family Forms", url: "https://web2.gov.mb.ca/laws/rules/regforms_e.php", desc: "Official forms index (may be slow)" },
      { label: "Legal Aid Manitoba", url: "https://www.legalaid.mb.ca/", desc: "Free legal help if you qualify — 204-985-8500" }
    ]
  }
};

const categoryColors = {
  "Initial Filing": "bg-blue-100 text-blue-700",
  "Divorce": "bg-purple-100 text-purple-700",
  "Response": "bg-orange-100 text-orange-700",
  "Financial Disclosure": "bg-green-100 text-green-700",
  "Service": "bg-yellow-100 text-yellow-700",
  "Parenting": "bg-pink-100 text-pink-700",
  "Interim Relief": "bg-red-100 text-red-700",
  "Variation": "bg-indigo-100 text-indigo-700",
  "Orders": "bg-teal-100 text-teal-700",
  "Reference": "bg-gray-100 text-gray-600",
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
      fetchForms(selectedJurisdiction.id);
      setExpandedStep(null);
      setSelectedCategory("all");
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

  const fetchForms = async (jurisdictionId) => {
    const { data, error } = await supabase
      .from("forms")
      .select("*")
      .eq("jurisdiction_id", jurisdictionId)
      .order("display_order", { ascending: true });
    if (error) console.error(error);
    setForms(data || []);
  };

  const kit = SELF_HELP_KITS[selectedJurisdiction?.id];
  const hasRealForms = forms.length > 0;
  const formsWithDirectLinks = forms.filter(f => f.download_url && !f.download_url.includes('saskatchewan.ca/residents') && !f.download_url.includes('familylaw.plea') && !f.download_url.includes('self-help'));
  const kitForms = forms.filter(f => f.download_url?.includes('saskatchewan.ca/residents') || f.download_url?.includes('familylaw.plea') || f.download_url?.includes('self-help') || f.download_url?.includes('publications.saskatchewan'));

  const categories = ["all", ...new Set(formsWithDirectLinks.map(f => f.category).filter(Boolean))];
  const filteredForms = selectedCategory === "all" ? formsWithDirectLinks : formsWithDirectLinks.filter(f => f.category === selectedCategory);

  const canadianJurisdictions = jurisdictions.filter(j => j.country === 'Canada');
  const usJurisdictions = jurisdictions.filter(j => j.country === 'USA');

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
      <PageTitle title="Court Forms" subtitle="Download official forms and step-by-step guides" icon="📄" />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Jurisdiction Selector */}
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

        {/* DIRECT DOWNLOAD FORMS (provinces with real PDFs) */}
        {formsWithDirectLinks.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-800 text-lg">📥 Download Forms</h2>

            {/* Category filter */}
            {categories.length > 2 && (
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      selectedCategory === cat ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-red-300'
                    }`}
                  >
                    {cat === "all" ? "All Forms" : cat}
                  </button>
                ))}
              </div>
            )}

            {filteredForms.map((form) => (
              <div key={form.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-red-600 font-mono text-sm font-medium">{form.form_number}</span>
                      {form.category && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[form.category] || 'bg-gray-100 text-gray-600'}`}>
                          {form.category}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{form.name}</h3>
                    <p className="text-gray-600 text-sm">{form.description}</p>
                  </div>
                  <a
                    href={form.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex-shrink-0 whitespace-nowrap"
                  >
                    📄 Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SELF-HELP KIT WALKTHROUGH */}
        {kit && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <h2 className="font-bold text-amber-900 text-lg mb-2">📦 {kit.title}</h2>
              <p className="text-amber-800 text-sm leading-relaxed">{kit.intro}</p>

              {kit.contact && (
                <div className="mt-4 bg-white rounded-lg p-4 border border-amber-200 text-sm space-y-1">
                  <p className="font-semibold text-gray-800 mb-2">📞 Family Law Information Centre</p>
                  <p className="text-gray-700">Toll Free: <a href={`tel:${kit.contact.phone}`} className="text-red-600 font-medium">{kit.contact.phone}</a></p>
                  {kit.contact.localPhone && <p className="text-gray-700">Local: <a href={`tel:${kit.contact.localPhone}`} className="text-red-600 font-medium">{kit.contact.localPhone}</a></p>}
                  <p className="text-gray-700">Email: <a href={`mailto:${kit.contact.email}`} className="text-red-600 font-medium">{kit.contact.email}</a></p>
                  {kit.contact.hours && <p className="text-gray-500 text-xs mt-1">{kit.contact.hours}</p>}
                </div>
              )}
            </div>

            {/* Step-by-step walkthrough */}
            <h3 className="font-semibold text-gray-800">Step-by-Step Walkthrough</h3>
            <div className="space-y-3">
              {kit.steps.map((step) => (
                <div key={step.number} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedStep(expandedStep === step.number ? null : step.number)}
                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-red-700 font-bold text-sm">{step.number}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{step.icon}</span>
                        <span className="font-semibold text-gray-900">{step.title}</span>
                      </div>
                    </div>
                    <span className="text-gray-400 text-lg">{expandedStep === step.number ? '▲' : '▼'}</span>
                  </button>

                  {expandedStep === step.number && (
                    <div className="px-4 pb-5 pt-1 border-t border-gray-100 space-y-4">
                      <p className="text-gray-700 text-sm leading-relaxed">{step.description}</p>

                      {step.checklist && (
                        <ul className="space-y-2">
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
                          {step.details.map((detail, i) => (
                            <div key={i} className="bg-gray-50 rounded-lg p-3">
                              <p className="font-semibold text-gray-800 text-sm">{detail.label}</p>
                              <p className="text-gray-600 text-sm mt-0.5">{detail.desc}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {step.tip && (
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-2">
                          <span className="text-blue-500 flex-shrink-0">💡</span>
                          <p className="text-blue-800 text-sm">{step.tip}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Kit-related forms (sample clauses, wizard, etc.) */}
            {kitForms.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800">📎 Helpful Resources & Documents</h3>
                {kitForms.map((form) => (
                  <div key={form.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{form.name}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{form.description}</p>
                    </div>
                    <a
                      href={form.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs font-medium flex-shrink-0"
                    >
                      Open →
                    </a>
                  </div>
                ))}
              </div>
            )}

            {/* Additional resources */}
            {kit.resources && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800">🔗 Additional Resources</h3>
                {kit.resources.map((res, i) => (
                  <a
                    key={i}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-red-300 transition-colors"
                  >
                    <p className="font-semibold text-red-600 text-sm">{res.label} →</p>
                    <p className="text-gray-500 text-xs mt-0.5">{res.desc}</p>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* No forms and no kit */}
        {!kit && forms.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <p className="text-gray-600 mb-2">Forms for {selectedJurisdiction?.name} are being added.</p>
            <p className="text-sm text-gray-400">Check back soon or contact your provincial court directly.</p>
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
