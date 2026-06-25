'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

const FDR_OFFICES = [
  { city: 'Regina', phone: '306-787-5749', address: '2151 Scarth St, Regina SK', hours: 'Mon–Fri 8:00am–5:00pm' },
  { city: 'Saskatoon', phone: '306-933-6230', address: '101-110 21st St E, Saskatoon SK', hours: 'Mon–Fri 8:00am–5:00pm' },
  { city: 'Prince Albert', phone: '306-953-2660', address: '800 Central Ave, Prince Albert SK', hours: 'Mon–Fri 8:00am–5:00pm' },
  { city: 'Moose Jaw', phone: '306-694-3659', address: '111 Fairford St E, Moose Jaw SK', hours: 'Mon–Fri 8:00am–5:00pm' },
];

const STAGES = [
  {
    id: 'not_started',
    icon: '🕊️',
    label: "I haven't started mediation yet",
    desc: "I need to understand what mediation is and how to get started.",
  },
  {
    id: 'in_progress',
    icon: '🔄',
    label: "I'm currently in mediation",
    desc: "I've booked or started the process but haven't finished.",
  },
  {
    id: 'completed',
    icon: '✅',
    label: "I've completed mediation",
    desc: "I have my completion certificate and I'm ready to file.",
  },
  {
    id: 'active_case',
    icon: '🏛️',
    label: "I already have an active court case",
    desc: "My matter is already before the court — mediation may already be done or exempted.",
  },
  {
    id: 'exemption',
    icon: '🛡️',
    label: "I believe I qualify for a mediation exemption",
    desc: "Domestic violence, urgency, or another approved reason to bypass mediation.",
  },
];

export default function MediationModule() {
  const router = useRouter();
  const [stage, setStage] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const path = `${user.id}/fdr-certificate/${file.name}`;
      const { error } = await supabase.storage.from('documents').upload(path, file, { upsert: true });
      if (!error) setUploadedFile(file.name);
    } catch (err) {
      console.error('Upload error:', err);
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('users').update({
        mediation_status: stage,
        fdr_completed: stage === 'completed' || stage === 'active_case',
        fdr_confirmed: confirmed,
      }).eq('id', user.id);
    } catch (err) {
      console.error('Save error:', err);
    }
    setSaving(false);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <a href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</a>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium text-gray-700">Mediation & FDR</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Intro Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-8">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🕊️</span>
            <div>
              <h2 className="font-bold text-blue-900 mb-1">Mediation comes first in Saskatchewan</h2>
              <p className="text-blue-800 text-sm leading-relaxed">
                Before a Saskatchewan court will accept most family law applications, you must first attempt mediation. This is not optional — the court requires proof of mediation before your application can proceed.
              </p>
              <p className="text-blue-700 text-sm mt-2">
                FDR is free, government-run, and designed to help both parties reach an agreement without
                going to court. Many families resolve their matters entirely through mediation.
              </p>
            </div>
          </div>
        </div>

        {/* Stage Selection */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Where are you with mediation?</h1>
        <p className="text-gray-500 text-sm mb-6">Select the option that best describes your current situation.</p>

        <div className="space-y-3 mb-8">
          {STAGES.map((s) => (
            <button
              key={s.id}
              onClick={() => { setStage(s.id); setConfirmed(false); }}
              className={`w-full text-left flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all ${
                stage === s.id
                  ? 'bg-red-600 border-red-600 text-white'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-red-300'
              }`}
            >
              <span className="text-2xl flex-shrink-0">{s.icon}</span>
              <div>
                <div className="font-semibold text-sm">{s.label}</div>
                <div className={`text-xs mt-0.5 ${stage === s.id ? 'text-red-100' : 'text-gray-400'}`}>{s.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Stage-specific content */}

        {/* NOT STARTED */}
        {stage === 'not_started' && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-3">What is FDR?</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Family Dispute Resolution (FDR) is a free, confidential service offered by the Government of
                Saskatchewan. A trained mediator meets with both parties — together or separately — to help
                reach an agreement on parenting time, decision-making, and support.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                If you reach an agreement, FDR can help you formalize it. If you don't, you'll receive a
                Certificate of Compliance that allows you to proceed to court.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-1">What to expect</h3>
              <p className="text-gray-500 text-xs mb-4">The mediation process typically looks like this:</p>
              <div className="space-y-3">
                {[
                  { step: '1', title: 'Book your intake appointment', desc: 'Call your local mediation office. The intake is usually by phone or in person.' },
                  { step: '2', title: 'Complete the "Parenting After Separation" course', desc: 'Required for most applicants. Available online and takes about 3 hours.' },
                  { step: '3', title: 'Attend mediation sessions', desc: 'Meet with your mediator. Sessions may be joint or separate depending on your situation.' },
                  { step: '4', title: 'Receive your Certificate of Compliance', desc: "Whether or not you reach an agreement, you'll receive a certificate to file with the court." },
                ].map((item) => (
                  <div key={item.step} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold flex-shrink-0">{item.step}</div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{item.title}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Saskatchewan Mediation Offices</h3>
              <div className="space-y-3">
                {FDR_OFFICES.map((office) => (
                  <div key={office.city} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <span className="text-lg">📍</span>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{office.city}</div>
                      <div className="text-gray-500 text-xs">{office.address}</div>
                      <a href={`tel:${office.phone}`} className="text-red-600 text-xs font-medium">{office.phone}</a>
                      <div className="text-gray-400 text-xs">{office.hours}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-semibold transition-colors"
            >
              Return to Dashboard — I'll Book FDR
            </button>
          </div>
        )}

        {/* IN PROGRESS */}
        {stage === 'in_progress' && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-3">You're in the right place</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                While you're in mediation, use this time to get organized. The more prepared you are,
                the more productive your sessions will be — and the better your outcome.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">While you're in mediation, you can:</h3>
              <div className="space-y-3">
                {[
                  { icon: '📅', label: 'Build a parenting schedule proposal', link: '/schedule-builder' },
                  { icon: '💰', label: 'Calculate child support amounts', link: '/calculator' },
                  { icon: '💬', label: 'Use the co-parent messenger for documented communication', link: '/coparent' },
                  { icon: '📁', label: 'Organize your documents and evidence', link: '/documents' },
                  { icon: '📋', label: 'Review the filing guide for what comes next', link: '/filing' },
                ].map((item) => (
                  <a key={item.label} href={item.link} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-red-50 hover:border-red-200 border border-transparent transition-all">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm text-gray-700 font-medium">{item.label}</span>
                    <span className="ml-auto text-gray-400 text-xs">→</span>
                  </a>
                ))}
              </div>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-semibold transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {/* COMPLETED */}
        {stage === 'completed' && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <h3 className="font-bold text-green-900 mb-1">Mediation Complete — You're Ready to File</h3>
                  <p className="text-green-800 text-sm">
                    With your mediation certificate, your application can now proceed to court.
                    The filing guide will walk you through every step from here.
                  </p>
                </div>
              </div>
            </div>

            {/* Confirmation checkbox */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <button
                onClick={() => setConfirmed(!confirmed)}
                className="flex items-start gap-3 w-full text-left"
              >
                <div className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${confirmed ? 'bg-red-600 border-red-600' : 'border-gray-300'}`}>
                  {confirmed && <span className="text-white text-xs">✓</span>}
                </div>
                <span className="text-sm text-gray-700">
                  I confirm that I have completed mediation and am ready to proceed.
                </span>
              </button>
            </div>

            {/* Optional upload */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-900 mb-1">Upload your mediation certificate (optional)</h3>
              <p className="text-gray-500 text-xs mb-4">
                Storing it here keeps everything in one place. You can skip this and upload later.
              </p>
              {uploadedFile ? (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <span className="text-green-600">✓</span>
                  <span className="text-green-800 text-sm font-medium">{uploadedFile}</span>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-red-400 hover:text-red-600 transition-colors"
                >
                  {uploading ? 'Uploading...' : '📎 Tap to upload your mediation certificate'}
                </button>
              )}
              <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileUpload} />
            </div>

            <button
              onClick={handleSave}
              disabled={!confirmed || saving}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-semibold transition-colors disabled:opacity-40"
            >
              {saving ? 'Saving...' : 'Continue to Filing Guide →'}
            </button>
          </div>
        )}

        {/* ACTIVE CASE */}
        {stage === 'active_case' && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-3">Already in court</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                If your matter is already before the court, FDR has likely already been completed or
                exempted. Your focus now is on preparing for what's ahead — hearings, filings, and deadlines.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Where to go from here</h3>
              <div className="space-y-3">
                {[
                  { icon: '📋', label: 'Review the filing guide', link: '/filing' },
                  { icon: '📅', label: 'Track your deadlines', link: '/deadlines' },
                  { icon: '📁', label: 'Organize your case documents', link: '/documents' },
                  { icon: '🏛️', label: 'Prepare for your hearing', link: '/judge-insight' },
                ].map((item) => (
                  <a key={item.label} href={item.link} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-red-50 border border-transparent hover:border-red-200 transition-all">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm text-gray-700 font-medium">{item.label}</span>
                    <span className="ml-auto text-gray-400 text-xs">→</span>
                  </a>
                ))}
              </div>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-semibold transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {/* EXEMPTION */}
        {stage === 'exemption' && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h3 className="font-bold text-amber-900 mb-1">Mediation Exemptions Are Granted by the Court</h3>
                  <p className="text-amber-800 text-sm">
                    You cannot self-declare an exemption — a judge must approve it. However, certain situations do qualify.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Common grounds for exemption</h3>
              <div className="space-y-3">
                {[
                  { icon: '🛡️', label: 'Domestic violence or abuse', desc: 'Where FDR would place either party at risk.' },
                  { icon: '🚨', label: 'Urgent circumstances', desc: 'Child safety at immediate risk or emergency protection needed.' },
                  { icon: '📍', label: 'Geographic barriers', desc: 'Where attending FDR is genuinely impractical.' },
                  { icon: '⚖️', label: 'Power imbalance', desc: 'Where fair negotiation is not possible.' },
                  { icon: '🤝', label: 'Prior agreement already reached', desc: 'Where parties have already settled outside of FDR.' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{item.label}</div>
                      <div className="text-gray-500 text-xs">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <p className="text-gray-600 text-sm">
                To apply for an exemption, you typically file a motion with supporting evidence at the time
                of your initial application. The AI assistant can help you understand this process in
                more detail.
              </p>
            </div>

            <a
              href="/dashboard"
              className="block w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-semibold text-center transition-colors"
            >
              Go to Dashboard
            </a>
          </div>
        )}

      </div>
    </div>
  );
}
