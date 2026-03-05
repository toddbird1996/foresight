// ============================================
// FORESIGHT - COURT FORMS DATABASE
// ============================================

// ============================================
// FORMS DATABASE BY JURISDICTION
// ============================================

export const FORMS_DATABASE = {
  saskatchewan: {
    jurisdiction: 'Saskatchewan',
    court: 'Court of King\'s Bench',
    website: 'https://sasklawcourts.ca',
    formsUrl: 'https://sasklawcourts.ca/forms',
    categories: [
      {
        id: 'initial-filing',
        name: 'Initial Filing',
        description: 'Forms to start your case',
        forms: [
          {
            id: 'sk-petition',
            name: 'Petition',
            formNumber: 'Form 70A',
            description: 'The main document to start a family law proceeding. Lists what orders you\'re asking for.',
            required: true,
            downloadUrl: 'https://sasklawcourts.ca/forms/family/form70a.pdf',
            fileType: 'pdf',
            fillable: true,
            pages: 4,
            tips: [
              'Complete all sections - don\'t leave blanks',
              'Be specific about the orders you want',
              'Include all children\'s names and birthdates',
              'Sign in front of a Commissioner of Oaths'
            ],
            relatedSteps: ['prepare-petition', 'initial-filing']
          },
          {
            id: 'sk-financial-statement',
            name: 'Financial Statement',
            formNumber: 'Form 70D',
            description: 'Detailed disclosure of your income, expenses, assets, and debts. Required for any support claims.',
            required: true,
            downloadUrl: 'https://sasklawcourts.ca/forms/family/form70d.pdf',
            fileType: 'pdf',
            fillable: true,
            pages: 12,
            tips: [
              'Attach last 3 years of tax returns and NOAs',
              'Include all sources of income',
              'Be accurate - this is sworn under oath',
              'Update if your financial situation changes'
            ],
            attachments: [
              'Last 3 years tax returns',
              'Notices of Assessment',
              'Recent pay stubs (3 months)',
              'Bank statements'
            ],
            relatedSteps: ['financial-statement']
          },
          {
            id: 'sk-affidavit',
            name: 'Affidavit',
            formNumber: 'Form 70F',
            description: 'Sworn statement of facts supporting your petition. Tell your story and provide evidence.',
            required: true,
            downloadUrl: 'https://sasklawcourts.ca/forms/family/form70f.pdf',
            fileType: 'pdf',
            fillable: false,
            pages: 'Variable',
            tips: [
              'Write in first person ("I", not "the Petitioner")',
              'Stick to facts, not opinions',
              'Organize chronologically',
              'Number each paragraph',
              'Attach exhibits and refer to them'
            ],
            relatedSteps: ['prepare-affidavit']
          }
        ]
      },
      {
        id: 'service',
        name: 'Service Documents',
        description: 'Forms for serving documents',
        forms: [
          {
            id: 'sk-affidavit-service',
            name: 'Affidavit of Personal Service',
            formNumber: 'Form 70K',
            description: 'Proof that documents were served on the other party. Completed by the person who served them.',
            required: true,
            downloadUrl: 'https://sasklawcourts.ca/forms/family/form70k.pdf',
            fileType: 'pdf',
            fillable: true,
            pages: 2,
            tips: [
              'Must be completed by the person who served (not you)',
              'Include exact date, time, and location of service',
              'Describe how the person was identified',
              'Attach a copy of what was served'
            ],
            relatedSteps: ['serve-respondent', 'proof-of-service']
          }
        ]
      },
      {
        id: 'jcc',
        name: 'Judicial Case Conference',
        description: 'Forms for JCC process',
        forms: [
          {
            id: 'sk-jcc-request',
            name: 'Request for JCC',
            formNumber: 'FAM-PD 7-2',
            description: 'Form to request a Judicial Case Conference. Usually the next step after filing.',
            required: true,
            downloadUrl: 'https://sasklawcourts.ca/forms/family/fam-pd-7-2.pdf',
            fileType: 'pdf',
            fillable: true,
            pages: 2,
            tips: [
              'Both parties should try to agree on dates',
              'Allow enough time for preparation',
              'Indicate issues to be discussed'
            ],
            relatedSteps: ['request-jcc']
          },
          {
            id: 'sk-jcc-brief',
            name: 'JCC Brief',
            formNumber: 'FAM-PD 7-5',
            description: 'Summary of issues and positions for the JCC. Helps the judge understand your case quickly.',
            required: true,
            downloadUrl: 'https://sasklawcourts.ca/forms/family/fam-pd-7-5.pdf',
            fileType: 'pdf',
            fillable: true,
            pages: 4,
            tips: [
              'Be concise - judges appreciate brevity',
              'Focus on key issues only',
              'Propose realistic solutions',
              'File at least 7 days before JCC'
            ],
            relatedSteps: ['prepare-jcc-brief', 'attend-jcc']
          }
        ]
      },
      {
        id: 'motions',
        name: 'Motions & Applications',
        description: 'Forms for interim applications',
        forms: [
          {
            id: 'sk-notice-motion',
            name: 'Notice of Motion',
            formNumber: 'Form 70H',
            description: 'Request for a hearing on a specific issue before trial. Used for urgent or interim matters.',
            required: false,
            downloadUrl: 'https://sasklawcourts.ca/forms/family/form70h.pdf',
            fileType: 'pdf',
            fillable: true,
            pages: 2,
            tips: [
              'State exactly what orders you want',
              'Include supporting affidavit',
              'Give proper notice to other party',
              'Book a court date before filing'
            ],
            relatedSteps: ['file-motion']
          }
        ]
      },
      {
        id: 'orders',
        name: 'Orders',
        description: 'Forms for court orders',
        forms: [
          {
            id: 'sk-consent-order',
            name: 'Consent Order',
            formNumber: 'Form 70P',
            description: 'Agreement between parties to be made a court order. Both parties must sign.',
            required: false,
            downloadUrl: 'https://sasklawcourts.ca/forms/family/form70p.pdf',
            fileType: 'pdf',
            fillable: true,
            pages: 3,
            tips: [
              'Both parties must sign',
              'Be specific about terms',
              'Include all agreed issues',
              'Submit to court for judge\'s signature'
            ],
            relatedSteps: ['consent-order']
          },
          {
            id: 'sk-parenting-plan',
            name: 'Parenting Plan Template',
            formNumber: 'N/A',
            description: 'Template for creating a detailed parenting plan. Not a court form but very useful.',
            required: false,
            downloadUrl: '/templates/sk-parenting-plan.pdf',
            fileType: 'pdf',
            fillable: true,
            pages: 8,
            tips: [
              'Be as detailed as possible',
              'Cover holidays and special occasions',
              'Include communication provisions',
              'Plan for schedule changes'
            ],
            internal: true
          }
        ]
      }
    ]
  },

  alberta: {
    jurisdiction: 'Alberta',
    court: 'Court of King\'s Bench',
    website: 'https://albertacourts.ca',
    formsUrl: 'https://www.alberta.ca/family-law-forms',
    categories: [
      {
        id: 'initial-filing',
        name: 'Initial Filing',
        forms: [
          {
            id: 'ab-statement-claim',
            name: 'Statement of Claim for Divorce',
            formNumber: 'FL-1',
            description: 'Main document to start divorce proceedings in Alberta.',
            required: true,
            downloadUrl: 'https://open.alberta.ca/publications/fl-1',
            fileType: 'pdf',
            fillable: true,
            pages: 6
          },
          {
            id: 'ab-financial-statement',
            name: 'Financial Statement',
            formNumber: 'FL-12',
            description: 'Complete disclosure of financial situation.',
            required: true,
            downloadUrl: 'https://open.alberta.ca/publications/fl-12',
            fileType: 'pdf',
            fillable: true,
            pages: 14
          },
          {
            id: 'ab-parenting-affidavit',
            name: 'Parenting Affidavit',
            formNumber: 'FL-2',
            description: 'Sworn statement about parenting arrangements and children.',
            required: true,
            downloadUrl: 'https://open.alberta.ca/publications/fl-2',
            fileType: 'pdf',
            fillable: true,
            pages: 8
          }
        ]
      },
      {
        id: 'parenting',
        name: 'Parenting',
        forms: [
          {
            id: 'ab-parenting-plan',
            name: 'Parenting Plan',
            formNumber: 'N/A',
            description: 'Template for detailed parenting arrangements.',
            required: false,
            downloadUrl: '/templates/ab-parenting-plan.pdf',
            fileType: 'pdf',
            fillable: true,
            pages: 10,
            internal: true
          }
        ]
      }
    ]
  },

  ontario: {
    jurisdiction: 'Ontario',
    court: 'Superior Court of Justice',
    website: 'https://ontariocourts.ca',
    formsUrl: 'https://ontariocourtforms.on.ca',
    categories: [
      {
        id: 'initial-filing',
        name: 'Initial Filing',
        forms: [
          {
            id: 'on-form-8',
            name: 'Application',
            formNumber: 'Form 8',
            description: 'The standard form to start most family law cases in Ontario.',
            required: true,
            downloadUrl: 'https://ontariocourtforms.on.ca/forms/family/08',
            fileType: 'pdf',
            fillable: true,
            pages: 6,
            tips: [
              'Choose correct court location',
              'Check all claims that apply',
              'Include all children',
              'Sign and date'
            ]
          },
          {
            id: 'on-form-13',
            name: 'Financial Statement (Support Claims)',
            formNumber: 'Form 13',
            description: 'Required when claiming child or spousal support.',
            required: true,
            downloadUrl: 'https://ontariocourtforms.on.ca/forms/family/13',
            fileType: 'pdf',
            fillable: true,
            pages: 16
          },
          {
            id: 'on-form-13-1',
            name: 'Financial Statement (Property)',
            formNumber: 'Form 13.1',
            description: 'Required when property division is an issue.',
            required: false,
            downloadUrl: 'https://ontariocourtforms.on.ca/forms/family/13-1',
            fileType: 'pdf',
            fillable: true,
            pages: 20
          },
          {
            id: 'on-form-35-1',
            name: 'Affidavit (General)',
            formNumber: 'Form 35.1',
            description: 'Sworn statement providing facts and evidence.',
            required: true,
            downloadUrl: 'https://ontariocourtforms.on.ca/forms/family/35-1',
            fileType: 'pdf',
            fillable: false,
            pages: 'Variable'
          }
        ]
      },
      {
        id: 'response',
        name: 'Responding to Application',
        forms: [
          {
            id: 'on-form-10',
            name: 'Answer',
            formNumber: 'Form 10',
            description: 'Response to an Application. File within 30 days of being served.',
            required: true,
            downloadUrl: 'https://ontariocourtforms.on.ca/forms/family/10',
            fileType: 'pdf',
            fillable: true,
            pages: 6
          }
        ]
      },
      {
        id: 'service',
        name: 'Service',
        forms: [
          {
            id: 'on-form-6b',
            name: 'Affidavit of Service',
            formNumber: 'Form 6B',
            description: 'Proof that documents were served.',
            required: true,
            downloadUrl: 'https://ontariocourtforms.on.ca/forms/family/6b',
            fileType: 'pdf',
            fillable: true,
            pages: 2
          }
        ]
      }
    ]
  },

  bc: {
    jurisdiction: 'British Columbia',
    court: 'Provincial Court / Supreme Court',
    website: 'https://www.bccourts.ca',
    formsUrl: 'https://www2.gov.bc.ca/gov/content/justice/courthouse-services/documents-forms-702702702702702702702702',
    categories: [
      {
        id: 'provincial-court',
        name: 'Provincial Court Forms',
        description: 'For parenting and support matters (no divorce)',
        forms: [
          {
            id: 'bc-application',
            name: 'Application About a Family Law Matter',
            formNumber: 'Form 3',
            description: 'Start a family law case in Provincial Court.',
            required: true,
            downloadUrl: 'https://www2.gov.bc.ca/assets/gov/law-crime-and-justice/courthouse-services/court-files-702702702702702702702702-702702702702702702702702/family/pfa003.pdf',
            fileType: 'pdf',
            fillable: true,
            pages: 8
          },
          {
            id: 'bc-financial-statement',
            name: 'Financial Statement',
            formNumber: 'Form 4',
            description: 'Financial disclosure for support claims.',
            required: true,
            downloadUrl: 'https://www2.gov.bc.ca/assets/gov/law-crime-and-justice/courthouse-services/court-files-702702702702702702702702-702702702702702702702702/family/pfa004.pdf',
            fileType: 'pdf',
            fillable: true,
            pages: 12
          }
        ]
      },
      {
        id: 'supreme-court',
        name: 'Supreme Court Forms',
        description: 'For divorce and property division',
        forms: [
          {
            id: 'bc-notice-family-claim',
            name: 'Notice of Family Claim',
            formNumber: 'Form F3',
            description: 'Start a family law case in Supreme Court.',
            required: true,
            downloadUrl: 'https://www2.gov.bc.ca/assets/gov/law-crime-and-justice/courthouse-services/court-files-702702702702702702702702-702702702702702702702702/supreme-family/f3.pdf',
            fileType: 'pdf',
            fillable: true,
            pages: 10
          }
        ]
      }
    ]
  },

  manitoba: {
    jurisdiction: 'Manitoba',
    court: 'Court of King\'s Bench',
    website: 'https://www.manitobacourts.mb.ca',
    formsUrl: 'https://www.manitobacourts.mb.ca/court-of-kings-bench/forms/',
    categories: [
      {
        id: 'initial-filing',
        name: 'Initial Filing',
        forms: [
          {
            id: 'mb-petition',
            name: 'Petition',
            formNumber: 'Form 70A',
            description: 'Main document to start family proceedings.',
            required: true,
            downloadUrl: 'https://www.manitobacourts.mb.ca/forms/form70a.pdf',
            fileType: 'pdf',
            fillable: true,
            pages: 4
          }
        ]
      }
    ]
  }
};

// ============================================
// FORMS SERVICE
// ============================================

export const formsService = {
  /**
   * Get all forms for a jurisdiction
   */
  getByJurisdiction(jurisdictionId) {
    return FORMS_DATABASE[jurisdictionId] || null;
  },

  /**
   * Get all forms in a flat list
   */
  getAllForms(jurisdictionId) {
    const jurisdiction = FORMS_DATABASE[jurisdictionId];
    if (!jurisdiction) return [];
    
    return jurisdiction.categories.flatMap(cat => 
      cat.forms.map(form => ({
        ...form,
        category: cat.name,
        categoryId: cat.id
      }))
    );
  },

  /**
   * Get a specific form by ID
   */
  getFormById(jurisdictionId, formId) {
    const forms = this.getAllForms(jurisdictionId);
    return forms.find(f => f.id === formId) || null;
  },

  /**
   * Get forms for a specific filing step
   */
  getFormsForStep(jurisdictionId, stepId) {
    const forms = this.getAllForms(jurisdictionId);
    return forms.filter(f => f.relatedSteps?.includes(stepId));
  },

  /**
   * Search forms
   */
  searchForms(jurisdictionId, query) {
    const forms = this.getAllForms(jurisdictionId);
    const lowerQuery = query.toLowerCase();
    
    return forms.filter(f =>
      f.name.toLowerCase().includes(lowerQuery) ||
      f.formNumber?.toLowerCase().includes(lowerQuery) ||
      f.description?.toLowerCase().includes(lowerQuery)
    );
  },

  /**
   * Get required forms only
   */
  getRequiredForms(jurisdictionId) {
    const forms = this.getAllForms(jurisdictionId);
    return forms.filter(f => f.required);
  }
};

// ============================================
// REACT COMPONENTS
// ============================================

import React, { useState, useMemo } from 'react';

/**
 * Forms Library Page
 */
export function FormsLibrary({ jurisdictionId = 'saskatchewan' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const jurisdiction = FORMS_DATABASE[jurisdictionId];
  
  const filteredForms = useMemo(() => {
    let forms = formsService.getAllForms(jurisdictionId);
    
    if (selectedCategory !== 'all') {
      forms = forms.filter(f => f.categoryId === selectedCategory);
    }
    
    if (searchQuery) {
      forms = formsService.searchForms(jurisdictionId, searchQuery);
    }
    
    return forms;
  }, [jurisdictionId, selectedCategory, searchQuery]);

  if (!jurisdiction) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-400">Jurisdiction not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 px-4 py-4">
        <h1 className="text-xl font-bold">{jurisdiction.jurisdiction} Court Forms</h1>
        <p className="text-sm text-slate-400">{jurisdiction.court}</p>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Search */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search forms..."
            className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Forms
          </button>
          {jurisdiction.categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Forms List */}
        <div className="space-y-3">
          {filteredForms.map((form) => (
            <FormCard key={form.id} form={form} />
          ))}
          
          {filteredForms.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              No forms found matching your search.
            </div>
          )}
        </div>

        {/* External Link */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <p className="text-sm text-slate-400 mb-2">
            For the most up-to-date forms, visit:
          </p>
          <a
            href={jurisdiction.formsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-400 hover:text-orange-300"
          >
            {jurisdiction.website} →
          </a>
        </div>
      </main>
    </div>
  );
}

/**
 * Individual Form Card
 */
function FormCard({ form }) {
  const [expanded, setExpanded] = useState(false);

  const handleDownload = () => {
    // Track download analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'form_download', {
        form_id: form.id,
        form_name: form.name
      });
    }
    
    // Open download URL
    window.open(form.downloadUrl, '_blank');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      {/* Main Row */}
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
            form.required ? 'bg-orange-500/20' : 'bg-slate-800'
          }`}>
            📄
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{form.name}</h3>
              {form.required && (
                <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full flex-shrink-0">
                  Required
                </span>
              )}
            </div>
            {form.formNumber && (
              <p className="text-sm text-slate-400 mb-1">{form.formNumber}</p>
            )}
            <p className="text-sm text-slate-500 line-clamp-2">{form.description}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              {expanded ? '▲' : '▼'}
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg font-medium text-sm"
            >
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-slate-800 p-4 space-y-4">
          {/* Meta info */}
          <div className="flex flex-wrap gap-4 text-sm">
            {form.fileType && (
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Type:</span>
                <span className="uppercase">{form.fileType}</span>
              </div>
            )}
            {form.pages && (
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Pages:</span>
                <span>{form.pages}</span>
              </div>
            )}
            {form.fillable && (
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                Fillable PDF
              </span>
            )}
          </div>

          {/* Tips */}
          {form.tips && form.tips.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-orange-400 mb-2">💡 Tips</h4>
              <ul className="space-y-1">
                {form.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                    <span className="text-slate-600">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Required Attachments */}
          {form.attachments && form.attachments.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-blue-400 mb-2">📎 Required Attachments</h4>
              <ul className="space-y-1">
                {form.attachments.map((att, i) => (
                  <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                    <span className="text-slate-600">•</span>
                    {att}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Forms Checklist Component
 * Shows required forms for the user's situation
 */
export function FormsChecklist({ jurisdictionId, completedForms = [], onToggle }) {
  const requiredForms = formsService.getRequiredForms(jurisdictionId);
  const completedCount = completedForms.length;
  const progress = requiredForms.length > 0 
    ? Math.round((completedCount / requiredForms.length) * 100)
    : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">📋 Required Forms</h3>
        <span className="text-sm text-orange-400">{completedCount}/{requiredForms.length}</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-800 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Forms list */}
      <div className="space-y-2">
        {requiredForms.map((form) => {
          const isCompleted = completedForms.includes(form.id);
          return (
            <div
              key={form.id}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                isCompleted ? 'bg-green-500/10' : 'bg-slate-800/50'
              }`}
            >
              <button
                onClick={() => onToggle?.(form.id)}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-slate-600 hover:border-green-500'
                }`}
              >
                {isCompleted && '✓'}
              </button>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{form.name}</div>
                {form.formNumber && (
                  <div className="text-xs text-slate-500">{form.formNumber}</div>
                )}
              </div>
              <a
                href={form.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400 hover:text-orange-300 text-sm"
              >
                Get →
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Form Quick Access Widget
 * Shows in filing guide steps
 */
export function FormQuickAccess({ jurisdictionId, stepId }) {
  const forms = formsService.getFormsForStep(jurisdictionId, stepId);

  if (forms.length === 0) return null;

  return (
    <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
      <h4 className="text-sm font-medium text-blue-400 mb-2">📄 Forms for this step</h4>
      <div className="space-y-2">
        {forms.map((form) => (
          <a
            key={form.id}
            href={form.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white"
          >
            <span>📎</span>
            <span>{form.name}</span>
            {form.formNumber && (
              <span className="text-slate-500">({form.formNumber})</span>
            )}
            <span className="text-blue-400 ml-auto">↓</span>
          </a>
        ))}
      </div>
    </div>
  );
}

// ============================================
// EXPORTS
// ============================================

export default {
  FORMS_DATABASE,
  formsService,
  FormsLibrary,
  FormCard,
  FormsChecklist,
  FormQuickAccess
};
