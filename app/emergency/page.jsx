'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import PageTitle from '../components/PageTitle';
import Footer from '../components/Footer';

const EMERGENCY_CONTACTS = [
  { name: 'Emergency Services', number: '911', desc: 'Police, Fire, Ambulance — immediate danger', icon: '🚨', color: 'bg-red-600' },
  { name: 'Kids Help Phone', number: '1-800-668-6868', desc: '24/7 counselling for children and youth', icon: '📞', color: 'bg-blue-600' },
  { name: 'Crisis Services Canada', number: '1-833-456-4566', desc: '24/7 suicide prevention and crisis support', icon: '💚', color: 'bg-green-600' },
  { name: 'Victim Services', number: '1-866-863-0511', desc: 'Support for victims of crime and violence', icon: '🛡️', color: 'bg-purple-600' },
  { name: 'National DV Hotline', number: '1-800-799-7233', desc: 'Domestic violence crisis line', icon: '🏠', color: 'bg-amber-600' },
];

const PROVINCES = [
  {
    id: 'saskatchewan',
    name: 'Saskatchewan',
    legislation: 'The Children\'s Law Act, 1997',
    formName: 'Notice of Application (Form 15-32) — Without Notice',
    formDesc: 'File an urgent application without notice to the other party when there is an immediate risk to the child. The court can grant interim custody, restraining orders, or supervised access on an emergency basis.',
    howToFile: [
      'Prepare Form 15-32 (Notice of Application) marking it as "without notice"',
      'Prepare a supporting Affidavit (Form 15-39) explaining the emergency in detail',
      'Include all evidence: police reports, photos, text messages, medical records',
      'File at the Court of King\'s Bench — ask the clerk for an emergency hearing',
      'The judge may hear your application the same day or next morning',
      'If an order is granted, you must serve the other party and return to court within a set timeframe',
    ],
    formUrl: 'https://publications.saskatchewan.ca/api/v1/products/114414/formats/129082/download',
    legalAid: '1-800-667-3764',
    crisis: [
      { name: 'Mobile Crisis Services (Saskatoon)', number: '306-933-6200' },
      { name: 'Mobile Crisis Services (Regina)', number: '306-525-5333' },
      { name: 'Prince Albert Mobile Crisis', number: '306-764-1011' },
      { name: 'Saskatchewan Child Abuse Hotline', number: '1-800-252-4453' },
      { name: 'Family Violence Info Line', number: '310-1818' },
    ],
  },
  {
    id: 'alberta',
    name: 'Alberta',
    legislation: 'Family Law Act, SA 2003',
    formName: 'Emergency Protection Order (EPO)',
    formDesc: 'Apply for an Emergency Protection Order through a Justice of the Peace — available 24/7 by phone. Also file a Without Notice Application (Form FL-18) at the Court of King\'s Bench for emergency custody or restraining orders.',
    howToFile: [
      'For an EPO: Call the police or a Victim Service Unit — they can contact a JP 24/7',
      'The JP can grant the EPO by phone immediately',
      'For emergency custody: Prepare Form FL-18 (Application) marked without notice',
      'File a sworn Affidavit detailing the emergency',
      'File at the Court of King\'s Bench and request an urgent hearing',
      'EPOs last up to 9 days and must be reviewed by a Queen\'s Bench Justice',
    ],
    formUrl: 'https://formsmgmt.gov.ab.ca/Public/CTS12365.xdp',
    legalAid: '1-866-845-3425',
    crisis: [
      { name: 'Alberta Family Violence Info Line', number: '310-1818' },
      { name: 'Child Abuse Hotline', number: '1-800-387-5437' },
      { name: 'Calgary Distress Centre', number: '403-266-4357' },
      { name: 'Edmonton Crisis Line', number: '780-482-4357' },
      { name: 'Alberta Mental Health Helpline', number: '1-877-303-2642' },
    ],
  },
  {
    id: 'ontario',
    name: 'Ontario',
    legislation: 'Children\'s Law Reform Act / Family Law Rules',
    formName: 'Motion Without Notice (Form 14B)',
    formDesc: 'File a Motion Without Notice when there is an immediate risk to a child. Under Rule 14(12), you must show that delay would cause serious harm. The court can grant temporary custody, restraining orders, or supervised access.',
    howToFile: [
      'Prepare Form 14B (Motion Form) checking "without notice to other party"',
      'Prepare Form 14A (Affidavit) explaining why notice is not possible and the urgency',
      'Include all evidence of risk: police reports, CAS records, medical documentation',
      'File at the Superior Court of Justice or Ontario Court of Justice (Family Court)',
      'Request an urgent hearing from the court clerk',
      'If granted, you must serve the other party and return for a with-notice hearing (usually 14 days)',
    ],
    formUrl: 'https://ontariocourtforms.on.ca/static/media/uploads/courtforms/family/14b/flr-14b-nov09-en.pdf',
    legalAid: '1-800-668-8258',
    crisis: [
      { name: 'Assaulted Women\'s Helpline', number: '1-866-863-0511' },
      { name: 'Ontario Child Abuse Hotline', number: '1-800-422-4453' },
      { name: 'Kids Help Phone', number: '1-800-668-6868' },
      { name: 'ConnexOntario (Mental Health)', number: '1-866-531-2600' },
      { name: 'Victim Support Line', number: '1-888-579-2888' },
    ],
  },
  {
    id: 'british_columbia',
    name: 'British Columbia',
    legislation: 'Family Law Act, SBC 2011',
    formName: 'Application About a Priority Parenting Matter (Form 15)',
    formDesc: 'Form 15 is specifically designed for urgent parenting matters including risk of harm, removal of a child from BC, or denial of parenting time. Can be filed without notice in emergencies under Rule 97.',
    howToFile: [
      'Prepare Form 15 (Application About a Priority Parenting Matter)',
      'Also prepare Form 11 (Application for Case Management Order Without Notice or Attendance)',
      'File a supporting Affidavit with all evidence of emergency',
      'File at Provincial Court or Supreme Court depending on your situation',
      'The court can hear your application without the other party present',
      'Protection orders under Part 9 of the Family Law Act can also be obtained without notice',
    ],
    formUrl: 'https://www2.gov.bc.ca/assets/gov/law-crime-and-justice/courthouse-services/court-files-records/court-forms/family/pfa722.pdf',
    legalAid: '1-866-577-2525',
    crisis: [
      { name: 'VictimLink BC', number: '1-800-563-0808' },
      { name: 'BC Crisis Centre', number: '1-800-784-2433' },
      { name: 'Helpline for Children (Reporting)', number: '310-1234' },
      { name: 'BC 211 (Community Services)', number: '211' },
      { name: 'RCMP Non-Emergency', number: 'Local detachment' },
    ],
  },
  {
    id: 'manitoba',
    name: 'Manitoba',
    legislation: 'Family Maintenance Act / Domestic Violence and Stalking Act',
    formName: 'Ex Parte Motion (Form 70H) / Protection Order',
    formDesc: 'File an ex parte (without notice) motion under the King\'s Bench Rules for emergency custody. Manitoba also has a dedicated Protection Order process — a designated Justice of the Peace can grant orders 24/7.',
    howToFile: [
      'For a Protection Order: Contact police or call the Protection Order Helpline',
      'A JP can grant the order by phone 24/7',
      'For emergency custody: Prepare Form 70H (Notice of Motion) marked ex parte',
      'File a supporting Affidavit explaining the immediate risk',
      'File at the Court of King\'s Bench (Family Division)',
      'The order is temporary — a with-notice hearing follows within days',
    ],
    formUrl: 'https://web2.gov.mb.ca/laws/rules/70he.pdf',
    legalAid: '1-800-261-2960',
    crisis: [
      { name: 'Manitoba Domestic Violence Crisis Line', number: '1-877-977-0007' },
      { name: 'Klinic Crisis Line (Winnipeg)', number: '204-786-8686' },
      { name: 'Child and Family Services Emergency', number: '204-944-4200' },
      { name: 'Manitoba Suicide Prevention', number: '1-877-435-7170' },
      { name: 'Protection Order Helpline', number: '204-945-0105' },
    ],
  },
  {
    id: 'quebec',
    name: 'Quebec',
    legislation: 'Civil Code of Quebec / Code of Civil Procedure',
    formName: 'Application for Safeguard Order (Ordonnance de sauvegarde)',
    formDesc: 'Under Article 49 of the Code of Civil Procedure, a party may request a safeguard order without notice when immediate action is required to prevent serious harm to a child. The court can grant provisional custody and access restrictions.',
    howToFile: [
      'Prepare an Application for Safeguard Order (no standardized form — draft with legal aid or Juripop)',
      'Include a sworn declaration detailing the emergency',
      'File at the Superior Court of Quebec',
      'The court can hear you the same day in urgent matters',
      'Request "en urgence" filing from the court clerk',
      'The order is temporary and a full hearing is scheduled within days',
    ],
    formUrl: 'https://www.quebec.ca/en/justice-and-civil-status/judicial-system/forms-models/separation-divorce',
    legalAid: '514-864-2111',
    crisis: [
      { name: 'SOS Violence Conjugale', number: '1-800-363-9010' },
      { name: 'La Ligne Parents', number: '1-800-361-5085' },
      { name: 'Tel-Aide (Montreal)', number: '514-935-1101' },
      { name: 'DPJ (Youth Protection)', number: '1-800-463-9009' },
      { name: 'Info-Social', number: '811 (option 2)' },
    ],
  },
  {
    id: 'nova_scotia',
    name: 'Nova Scotia',
    legislation: 'Parenting and Support Act',
    formName: 'Emergency Interim Order Application',
    formDesc: 'Apply for an emergency interim order without notice under Rule 59 of the Civil Procedure Rules. For domestic violence situations, apply for an Emergency Protection Order through a JP available 24/7.',
    howToFile: [
      'For an EPO: Call police — they can contact a JP 24/7',
      'For emergency custody: File Form 59.07 (Notice of Application) marked as emergency/without notice',
      'Prepare a supporting Affidavit with all evidence',
      'File at the Supreme Court (Family Division)',
      'Request an urgent hearing from the court clerk',
      'An interim order is temporary and a with-notice hearing follows',
    ],
    formUrl: 'https://www.nsfamilylaw.ca/sites/default/files/editor-uploads/Court%20Forms/CPR%20Form%2059.07%20-%20Notice%20of%20Application%20(final)(p).pdf',
    legalAid: '1-902-420-6573',
    crisis: [
      { name: 'NS Mental Health Crisis Line', number: '1-888-429-8167' },
      { name: 'Transition House 24hr Line', number: '1-855-225-0220' },
      { name: 'Child Protection', number: '1-866-922-2434' },
      { name: 'Victim Services', number: '1-888-470-0773' },
    ],
  },
  {
    id: 'new_brunswick',
    name: 'New Brunswick',
    legislation: 'Family Services Act / Intimate Partner Violence Intervention Act',
    formName: 'Emergency Intervention Order / Ex Parte Application',
    formDesc: 'Under the Intimate Partner Violence Intervention Act, an Emergency Intervention Order can be obtained 24/7 from a designated person (often a JP). For emergency custody, file an ex parte application at the Court of King\'s Bench.',
    howToFile: [
      'For an Emergency Intervention Order: Contact police or call Chimo Helpline',
      'A designated person can grant the order 24/7 by phone',
      'For emergency custody: File an Application with supporting Affidavit at Court of King\'s Bench',
      'Mark the application as ex parte / without notice',
      'Request an urgent hearing',
      'The order is reviewed at a with-notice hearing within days',
    ],
    formUrl: 'https://www.courtsnb-coursnb.ca/content/cour/en/kings-bench/content/family-division/court-forms.html',
    legalAid: '506-453-2369',
    crisis: [
      { name: 'Chimo Helpline', number: '1-800-667-5005' },
      { name: 'NB Family Violence Helpline', number: '1-877-868-7888' },
      { name: 'Child Protection Emergency', number: '1-800-442-9799' },
      { name: 'Tele-Care', number: '811' },
    ],
  },
  {
    id: 'newfoundland',
    name: 'Newfoundland & Labrador',
    legislation: 'Children, Youth and Families Act / Family Violence Protection Act',
    formName: 'Emergency Protection Order / Urgent Application',
    formDesc: 'The Family Violence Protection Act allows for Emergency Protection Orders granted by a Provincial Court judge 24/7 by phone. For emergency custody, apply ex parte at the Supreme Court (Family Division).',
    howToFile: [
      'For an EPO: Contact RNC or RCMP — they can contact a judge 24/7',
      'The judge can grant an EPO by phone immediately',
      'For emergency custody: Prepare an ex parte Application with sworn Affidavit',
      'File at the Supreme Court (Family Division)',
      'Include evidence of immediate risk to the child',
      'The EPO lasts up to 90 days and can include custody provisions',
    ],
    formUrl: 'https://www.gov.nl.ca/jps/family-violence/',
    legalAid: '1-800-563-9911',
    crisis: [
      { name: 'NL Mental Health Crisis Line', number: '1-888-737-4668' },
      { name: 'Transition House (St. John\'s)', number: '709-753-1492' },
      { name: 'Child Protection', number: '709-729-7000' },
      { name: 'Victim Services', number: '1-888-357-2229' },
    ],
  },
  {
    id: 'pei',
    name: 'Prince Edward Island',
    legislation: 'Custody Jurisdiction and Enforcement Act / Victims of Family Violence Act',
    formName: 'Emergency Protection Order / Ex Parte Application',
    formDesc: 'Under the Victims of Family Violence Act, an EPO can be obtained from a JP 24/7. For emergency custody, file an ex parte application at the Supreme Court.',
    howToFile: [
      'For an EPO: Contact police — they will assist with JP application',
      'The JP can grant the order 24/7 by phone or in person',
      'For emergency custody: File an ex parte Application with supporting Affidavit',
      'File at the Supreme Court of PEI',
      'The EPO is reviewed at a hearing within 3-7 days',
    ],
    formUrl: 'https://www.princeedwardisland.ca/en/information/justice-and-public-safety/family-violence-prevention',
    legalAid: '902-368-6043',
    crisis: [
      { name: 'PEI Family Violence Prevention', number: '1-800-240-9894' },
      { name: 'Island Helpline', number: '1-800-218-2885' },
      { name: 'Child Protection', number: '902-368-6868' },
      { name: 'Anderson House (Shelter)', number: '902-892-0960' },
    ],
  },
  {
    id: 'northwest_territories',
    name: 'Northwest Territories',
    legislation: 'Children\'s Law Act / Protection Against Family Violence Act',
    formName: 'Emergency Protection Order',
    formDesc: 'Under the Protection Against Family Violence Act, an EPO can be obtained from a JP 24/7. The order can include temporary custody, exclusive possession of the home, and no-contact provisions.',
    howToFile: [
      'Contact RCMP — they will assist with JP application 24/7',
      'The JP can grant an EPO by phone',
      'For emergency custody beyond the EPO: Apply ex parte at the Supreme Court of NWT',
      'File a supporting Affidavit detailing the emergency',
      'The EPO must be reviewed by a Supreme Court judge within 3 days',
    ],
    formUrl: 'https://www.justice.gov.nt.ca/en/family-law/',
    legalAid: '867-873-7450',
    crisis: [
      { name: 'NWT Help Line', number: '1-800-661-0844' },
      { name: 'RCMP Non-Emergency', number: 'Local detachment' },
      { name: 'Child and Family Services', number: '867-873-7943' },
      { name: 'Family Violence Shelter (Yellowknife)', number: '867-873-8257' },
    ],
  },
  {
    id: 'yukon',
    name: 'Yukon',
    legislation: 'Family Violence Prevention Act / Children\'s Law Act',
    formName: 'Emergency Intervention Order',
    formDesc: 'Under the Family Violence Prevention Act, an Emergency Intervention Order can be obtained from a JP 24/7. This can include temporary custody, exclusive possession of the home, and no-contact orders.',
    howToFile: [
      'Contact RCMP — they will apply to a JP on your behalf 24/7',
      'The JP can grant the order by phone',
      'For emergency custody: Apply ex parte at the Supreme Court of Yukon',
      'File a sworn Affidavit with evidence of immediate risk',
      'The Emergency Intervention Order must be reviewed within 3 days',
    ],
    formUrl: 'https://yukon.ca/en/legal-and-social-supports/support-domestic-violence-and-abuse',
    legalAid: '867-667-5210',
    crisis: [
      { name: 'Yukon Help Line', number: '1-844-533-3030' },
      { name: 'Kaushee\'s Place (Women\'s Shelter)', number: '867-668-5733' },
      { name: 'RCMP Whitehorse', number: '867-667-5555' },
      { name: 'Child Abuse Reporting', number: '867-667-3002' },
    ],
  },
  {
    id: 'nunavut',
    name: 'Nunavut',
    legislation: 'Family Abuse Intervention Act / Children and Family Services Act',
    formName: 'Emergency Protection Order',
    formDesc: 'Under the Family Abuse Intervention Act, an Emergency Protection Order can be obtained from a JP or community justice of the peace 24/7. Available in Inuktitut and English.',
    howToFile: [
      'Contact RCMP — they will assist with the JP application 24/7',
      'A community JP can also grant the order',
      'The order can include temporary custody and no-contact provisions',
      'For longer-term emergency custody: Apply ex parte at the Nunavut Court of Justice',
      'The EPO must be reviewed by a judge, typically via circuit court',
      'Services available in Inuktitut',
    ],
    formUrl: 'https://www.gov.nu.ca/family-services',
    legalAid: '867-360-4600',
    crisis: [
      { name: 'Nunavut Kamatsiaqtut Help Line', number: '1-800-265-3333' },
      { name: 'RCMP Non-Emergency', number: 'Local detachment' },
      { name: 'Family Services Emergency', number: '867-975-5200' },
      { name: 'Qimaavik Women\'s Shelter (Iqaluit)', number: '867-979-4500' },
    ],
  },
];

export default function EmergencyPage() {
  const [selectedProvince, setSelectedProvince] = useState('saskatchewan');
  const province = PROVINCES.find(p => p.id === selectedProvince);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
        <PageTitle title="Emergency Resources" subtitle="Crisis contacts & urgent filings" icon="🚨" />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Emergency Contacts - Always Visible */}
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 mb-6">
          <h2 className="font-bold text-red-800 text-lg mb-4">🚨 If you or your children are in immediate danger, call 911</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {EMERGENCY_CONTACTS.map((c, i) => (
              <a key={i} href={`tel:${c.number.replace(/[^0-9]/g, '')}`}
                className="flex items-center gap-3 bg-white border border-red-200 rounded-xl p-3 hover:shadow-md transition-all">
                <div className={`w-10 h-10 ${c.color} rounded-full flex items-center justify-center text-lg text-white flex-shrink-0`}>
                  {c.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-sm">{c.name}</div>
                  <div className="text-xs text-gray-500">{c.desc}</div>
                </div>
                <div className="font-bold text-red-600 text-sm flex-shrink-0">{c.number}</div>
              </a>
            ))}
          </div>
        </div>

        {/* Province Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select your province for emergency filing information:</label>
          <select value={selectedProvince} onChange={e => setSelectedProvince(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-white focus:outline-none focus:border-red-400 text-base">
            {PROVINCES.map(p => (<option key={p.id} value={p.id}>🇨🇦 {p.name}</option>))}
          </select>
        </div>

        {province && (
          <>
            {/* Without Notice Filing */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6">
              <div className="bg-gray-900 p-5">
                <h2 className="font-bold text-white text-lg mb-1">⚡ Filing Without Notice — {province.name}</h2>
                <p className="text-gray-400 text-sm">{province.legislation}</p>
              </div>
              <div className="p-5">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
                  <h3 className="font-semibold text-amber-800 text-sm mb-1">{province.formName}</h3>
                  <p className="text-sm text-amber-700">{province.formDesc}</p>
                </div>

                <h3 className="font-semibold text-gray-900 mb-3">How to file:</h3>
                <div className="space-y-2 mb-5">
                  {province.howToFile.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</div>
                      <p className="text-sm text-gray-700">{step}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <a href={province.formUrl} target="_blank" rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium">
                    📄 Get Emergency Form
                  </a>
                  <a href={`tel:${province.legalAid.replace(/[^0-9]/g, '')}`}
                    className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-medium">
                    📞 Legal Aid: {province.legalAid}
                  </a>
                </div>
              </div>
            </div>

            {/* Provincial Crisis Contacts */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">📞 {province.name} Crisis Contacts</h3>
              <div className="space-y-2">
                {province.crisis.map((c, i) => (
                  <a key={i} href={`tel:${c.number.replace(/[^0-9]/g, '')}`}
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-red-50 rounded-xl transition-colors">
                    <span className="text-sm text-gray-700">{c.name}</span>
                    <span className="font-semibold text-red-600 text-sm">{c.number}</span>
                  </a>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Important Notes */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="font-semibold text-gray-900 mb-3">⚠️ Important Notes</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p><strong>Without-notice orders are temporary.</strong> The court will schedule a with-notice hearing where the other party can respond. You must attend this hearing or the order may be cancelled.</p>
            <p><strong>You must show urgency.</strong> Courts only grant without-notice orders when there is an immediate risk of harm to the child, removal of the child from the jurisdiction, or destruction of evidence.</p>
            <p><strong>Document everything.</strong> Take photos, save text messages, keep police report numbers, and get medical records. The more evidence you have, the stronger your emergency application.</p>
            <p><strong>Get legal help if possible.</strong> Many Legal Aid offices prioritize emergency family matters. Call them before filing if you can.</p>
          </div>
          <p className="text-[11px] text-gray-400 mt-4">This is general information, not legal advice. Emergency procedures vary by courthouse. Contact your local court or Legal Aid for specific guidance.</p>
        <Footer />
      </div>
      </main>
    </div>
  );
}
