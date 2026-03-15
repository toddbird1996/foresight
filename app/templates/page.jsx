'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import PageTitle from '../components/PageTitle';

const TEMPLATES = [
  {
    id: 'parenting-plan',
    name: 'Parenting Plan',
    icon: '👶',
    desc: 'Create a detailed parenting plan for custody arrangements, schedules, and decision-making.',
    time: '15-20 min',
    sections: [
      { id: 'children', title: 'Children Information', fields: [
        { id: 'childNames', label: 'Name(s) and age(s) of children', type: 'textarea', placeholder: 'e.g., Emma (age 7), Jake (age 4)' },
        { id: 'currentLiving', label: 'Where do the children currently live?', type: 'text', placeholder: 'e.g., Primarily with mother at 123 Main St, Saskatoon' },
      ]},
      { id: 'schedule', title: 'Regular Schedule', fields: [
        { id: 'weekdaySchedule', label: 'Weekday schedule (Monday–Friday)', type: 'textarea', placeholder: 'e.g., Children with Mother Mon–Wed, with Father Thu–Fri' },
        { id: 'weekendSchedule', label: 'Weekend schedule', type: 'textarea', placeholder: 'e.g., Alternating weekends, Friday 5pm to Sunday 6pm' },
        { id: 'pickupDropoff', label: 'Pickup/dropoff arrangements', type: 'textarea', placeholder: 'e.g., Father picks up from school on Thursdays, Mother picks up Sunday at 6pm from Father\'s home' },
      ]},
      { id: 'holidays', title: 'Holidays & Special Days', fields: [
        { id: 'holidays', label: 'Holiday schedule', type: 'textarea', placeholder: 'e.g., Christmas Eve with Mother, Christmas Day with Father (alternating years)' },
        { id: 'birthdays', label: 'Birthday arrangements', type: 'textarea', placeholder: 'e.g., Children spend their birthday with the parent who has them that day, other parent gets a celebration on their next scheduled time' },
        { id: 'summer', label: 'Summer vacation schedule', type: 'textarea', placeholder: 'e.g., Each parent gets 2 consecutive weeks, with 30 days notice' },
      ]},
      { id: 'decisions', title: 'Decision-Making', fields: [
        { id: 'majorDecisions', label: 'Major decisions (education, medical, religion)', type: 'textarea', placeholder: 'e.g., Joint decision-making for major decisions. Both parents must agree on school enrollment, non-emergency medical procedures, and religious instruction.' },
        { id: 'dayToDay', label: 'Day-to-day decisions', type: 'text', placeholder: 'e.g., The parent who has the children makes routine daily decisions' },
      ]},
      { id: 'communication', title: 'Communication', fields: [
        { id: 'parentComm', label: 'How will parents communicate?', type: 'textarea', placeholder: 'e.g., Through the Foresight Co-Parent Messenger for all non-emergency communication. Emergency calls by phone.' },
        { id: 'childComm', label: 'Children\'s communication with other parent', type: 'textarea', placeholder: 'e.g., Children may call/video call the other parent daily between 7-8pm' },
        { id: 'changes', label: 'How to handle schedule changes', type: 'textarea', placeholder: 'e.g., 48 hours notice required for non-emergency changes. Make-up time will be arranged.' },
      ]},
      { id: 'other', title: 'Additional Terms', fields: [
        { id: 'travel', label: 'Travel and relocation', type: 'textarea', placeholder: 'e.g., 30 days written notice for any travel outside the province. Both parents must consent to international travel.' },
        { id: 'newPartners', label: 'Introduction of new partners', type: 'textarea', placeholder: 'e.g., Neither parent will introduce a new romantic partner to the children until the relationship has been established for 6 months' },
        { id: 'other', label: 'Any other terms', type: 'textarea', placeholder: 'e.g., Neither parent will speak negatively about the other parent in front of the children' },
      ]},
    ],
  },
  {
    id: 'affidavit',
    name: 'Affidavit Outline',
    icon: '📝',
    desc: 'Create a structured outline for your sworn affidavit with guided prompts for each section.',
    time: '20-30 min',
    sections: [
      { id: 'intro', title: 'Introduction', fields: [
        { id: 'fullName', label: 'Your full legal name', type: 'text', placeholder: 'e.g., John David Smith' },
        { id: 'city', label: 'City and province where you live', type: 'text', placeholder: 'e.g., Saskatoon, Saskatchewan' },
        { id: 'relationship', label: 'Your relationship to the other party', type: 'text', placeholder: 'e.g., I am the father of Emma Smith (age 7) and Jake Smith (age 4). The respondent, Jane Smith, is their mother.' },
      ]},
      { id: 'background', title: 'Background', fields: [
        { id: 'relationship_history', label: 'Brief history of the relationship', type: 'textarea', placeholder: 'e.g., The respondent and I began our relationship in 2015, married in 2017, and separated in January 2025.' },
        { id: 'children_history', label: 'Children and living arrangements since separation', type: 'textarea', placeholder: 'e.g., Since separation, the children have lived primarily with me at 123 Main St. The respondent moved to 456 Oak Ave.' },
      ]},
      { id: 'parenting', title: 'Parenting & Care', fields: [
        { id: 'involvement', label: 'Describe your involvement in the children\'s lives', type: 'textarea', placeholder: 'e.g., I take the children to school daily, attend all parent-teacher meetings, coach Emma\'s soccer team, and prepare meals every evening.' },
        { id: 'stability', label: 'What stability do you provide?', type: 'textarea', placeholder: 'e.g., I have stable employment at XYZ Company since 2018. My home has separate bedrooms for each child. I live near their school.' },
      ]},
      { id: 'concerns', title: 'Concerns About the Other Party', fields: [
        { id: 'concerns', label: 'List specific concerns (with dates and evidence)', type: 'textarea', placeholder: 'e.g., On March 1, 2025, the respondent failed to pick up the children from school (text message evidence attached as Exhibit A).' },
        { id: 'impact', label: 'How do these concerns affect the children?', type: 'textarea', placeholder: 'e.g., Emma has expressed anxiety about overnight visits. Her school counselor has noted changes in behavior (report attached as Exhibit B).' },
      ]},
      { id: 'orders', title: 'Orders Requested', fields: [
        { id: 'orders', label: 'What orders are you asking the court to make?', type: 'textarea', placeholder: 'e.g., I am asking for:\n1. Primary residence of the children with me\n2. Defined parenting time for the respondent every other weekend\n3. Child support per the Federal Guidelines\n4. Joint decision-making for major decisions' },
      ]},
    ],
  },
];

export default function TemplatesPage() {
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [formData, setFormData] = useState({});
  const [currentSection, setCurrentSection] = useState(0);

  const updateField = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const generateDocument = () => {
    const template = TEMPLATES.find(t => t.id === activeTemplate);
    if (!template) return;

    let doc = `${template.name.toUpperCase()}\n${'═'.repeat(50)}\nGenerated by Foresight • ${new Date().toLocaleDateString('en-CA')}\n${'═'.repeat(50)}\n\n`;

    template.sections.forEach(section => {
      doc += `\n${section.title.toUpperCase()}\n${'─'.repeat(40)}\n\n`;
      section.fields.forEach(field => {
        const value = formData[field.id] || '[Not provided]';
        doc += `${field.label}:\n${value}\n\n`;
      });
    });

    doc += `\n${'═'.repeat(50)}\nIMPORTANT: This is a template/outline only. It is NOT a legal document.\nHave a lawyer review this before filing with the court.\nGenerated by Foresight (foresight-eta-three.vercel.app)\n`;

    const blob = new Blob([doc], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${template.id}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  if (!activeTemplate) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <PageTitle title="Document Templates" subtitle="Guided fill-in wizards" icon="📝" />
        <main className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-800">📝 These templates walk you through each section with prompts and examples. Your answers are exported as a structured document you can take to a lawyer or use as a basis for your court filings.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {TEMPLATES.map(t => (
              <button key={t.id} onClick={() => { setActiveTemplate(t.id); setCurrentSection(0); setFormData({}); }}
                className="bg-white border border-gray-200 rounded-2xl p-6 text-left hover:border-red-300 hover:shadow-md transition-all">
                <div className="text-3xl mb-3">{t.icon}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{t.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{t.desc}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>⏱️ {t.time}</span>
                  <span>📋 {t.sections.length} sections</span>
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  const template = TEMPLATES.find(t => t.id === activeTemplate);
  const section = template.sections[currentSection];
  const totalSections = template.sections.length;
  const progress = ((currentSection + 1) / totalSections) * 100;
  const filledFields = section.fields.filter(f => formData[f.id]?.trim()).length;
  const totalFields = section.fields.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveTemplate(null)} className="text-gray-400 hover:text-red-600">←</button>
              <h1 className="text-sm font-bold text-gray-900">{template.icon} {template.name}</h1>
            </div>
            <span className="text-xs text-gray-500">Section {currentSection + 1} of {totalSections}</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full"><div className="h-full bg-red-600 rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Section Nav */}
        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1">
          {template.sections.map((s, i) => (
            <button key={s.id} onClick={() => setCurrentSection(i)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                i === currentSection ? 'bg-red-600 text-white' : i < currentSection ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
              {i < currentSection ? '✓ ' : ''}{s.title}
            </button>
          ))}
        </div>

        {/* Section Content */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">{section.title}</h2>
          <p className="text-sm text-gray-500 mb-6">{filledFields}/{totalFields} fields completed</p>

          <div className="space-y-5">
            {section.fields.map(field => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea value={formData[field.id] || ''} onChange={e => updateField(field.id, e.target.value)}
                    placeholder={field.placeholder} rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:outline-none focus:border-red-400 resize-none" />
                ) : (
                  <input type="text" value={formData[field.id] || ''} onChange={e => updateField(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:outline-none focus:border-red-400" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button onClick={() => setCurrentSection(Math.max(0, currentSection - 1))} disabled={currentSection === 0}
            className="px-5 py-3 text-gray-500 text-sm disabled:opacity-30">← Previous</button>

          {currentSection < totalSections - 1 ? (
            <button onClick={() => setCurrentSection(currentSection + 1)}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm">
              Next Section →
            </button>
          ) : (
            <button onClick={generateDocument}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium text-sm">
              📄 Download Document
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
