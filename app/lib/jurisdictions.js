// ============================================
// FORESIGHT - EXPANDED JURISDICTIONS DATABASE
// ============================================

// ============================================
// JURISDICTION DATA STRUCTURE
// ============================================

export const JURISDICTIONS = {
  // ==========================================
  // CANADA - EXISTING
  // ==========================================
  
  saskatchewan: {
    id: 'saskatchewan',
    name: 'Saskatchewan',
    shortName: 'SK',
    country: 'Canada',
    flag: '🇨🇦',
    status: 'live',
    court: {
      name: 'Court of King\'s Bench',
      familyDivision: 'Family Law Division',
      website: 'https://sasklawcourts.ca'
    },
    legislation: [
      { name: 'The Children\'s Law Act, 2020', shortName: 'CLA', url: 'https://publications.saskatchewan.ca/#/products/105530' },
      { name: 'The Family Maintenance Act, 1997', shortName: 'FMA', url: 'https://publications.saskatchewan.ca/#/products/786' },
      { name: 'Divorce Act (Federal)', shortName: 'DA', url: 'https://laws-lois.justice.gc.ca/eng/acts/D-3.4/' }
    ],
    fees: {
      contested: 300,
      uncontested: 500,
      motion: 200,
      jcc: 0
    },
    timelines: {
      responseTime: 30,
      internationalResponse: 60,
      jccWait: '4-8 weeks',
      trialWait: '12-18 months'
    },
    requirements: {
      fdr: { required: true, name: 'Family Dispute Resolution', certificate: 'Certificate of Compliance' },
      parentingCourse: { required: true, name: 'For Kids\' Sake', hours: 3, online: true },
      financialDisclosure: { required: true, form: 'Form 70D' }
    },
    keyProcesses: [
      { id: 'fdr', name: 'Family Dispute Resolution', description: 'Mandatory mediation attempt before filing' },
      { id: 'jcc', name: 'Judicial Case Conference', description: 'Meeting with judge to narrow issues' },
      { id: 'pretrial', name: 'Pre-Trial Conference', description: 'Final settlement attempt before trial' }
    ],
    courtLocations: [
      { city: 'Regina', address: '2425 Victoria Ave', phone: '306-787-5250', primary: true },
      { city: 'Saskatoon', address: '520 Spadina Crescent E', phone: '306-933-5185' },
      { city: 'Prince Albert', address: '100 15th St E', phone: '306-953-3200' },
      { city: 'Moose Jaw', address: '46 Ominica St W', phone: '306-694-3602' },
      { city: 'Swift Current', address: '121 1st Ave NW', phone: '306-778-8400' }
    ],
    resources: {
      selfHelp: 'https://sasklawcourts.ca/family',
      legalAid: 'https://www.legalaid.sk.ca',
      mediationServices: 'https://saskatchewan.ca/residents/justice-crime-and-the-law/family-mediation'
    },
    childSupport: {
      guidelines: 'Federal Child Support Guidelines',
      table: 'Saskatchewan Table',
      calculator: 'https://www.justice.gc.ca/eng/fl-df/child-enfant/2017/look-rech.asp'
    }
  },

  alberta: {
    id: 'alberta',
    name: 'Alberta',
    shortName: 'AB',
    country: 'Canada',
    flag: '🇨🇦',
    status: 'live',
    court: {
      name: 'Court of King\'s Bench',
      familyDivision: 'Family and Youth Division',
      alternativeCourt: 'Alberta Court of Justice (Family Division)',
      website: 'https://albertacourts.ca'
    },
    legislation: [
      { name: 'Family Law Act', shortName: 'FLA', url: 'https://open.alberta.ca/publications/f04p5' },
      { name: 'Divorce Act (Federal)', shortName: 'DA', url: 'https://laws-lois.justice.gc.ca/eng/acts/D-3.4/' }
    ],
    fees: {
      contested: 260,
      uncontested: 400,
      motion: 200
    },
    timelines: {
      responseTime: 30,
      internationalResponse: 60
    },
    requirements: {
      parentingCourse: { required: true, name: 'Parenting After Separation', hours: 6, online: true },
      mit: { required: true, name: 'Mandatory Information Tables' },
      adr: { required: true, name: 'Alternative Dispute Resolution' }
    },
    courtLocations: [
      { city: 'Calgary', address: '601 5th St SW', phone: '403-297-7217', primary: true },
      { city: 'Edmonton', address: '1A Sir Winston Churchill Square', phone: '780-422-2492' },
      { city: 'Red Deer', address: '4909 48th Ave', phone: '403-340-5164' },
      { city: 'Lethbridge', address: '320 4th St S', phone: '403-381-5224' }
    ],
    resources: {
      selfHelp: 'https://www.alberta.ca/family-law',
      resolution: 'https://www.alberta.ca/family-justice-services'
    }
  },

  ontario: {
    id: 'ontario',
    name: 'Ontario',
    shortName: 'ON',
    country: 'Canada',
    flag: '🇨🇦',
    status: 'live',
    court: {
      name: 'Superior Court of Justice',
      familyDivision: 'Family Court',
      alternativeCourt: 'Ontario Court of Justice',
      website: 'https://ontariocourts.ca'
    },
    legislation: [
      { name: 'Family Law Act', shortName: 'FLA', url: 'https://www.ontario.ca/laws/statute/90f03' },
      { name: 'Children\'s Law Reform Act', shortName: 'CLRA', url: 'https://www.ontario.ca/laws/statute/90c12' },
      { name: 'Divorce Act (Federal)', shortName: 'DA', url: 'https://laws-lois.justice.gc.ca/eng/acts/D-3.4/' }
    ],
    fees: {
      application: 202,
      divorce_registration: 10,
      divorce_review: 400,
      motion: 127
    },
    timelines: {
      responseTime: 30,
      internationalResponse: 60
    },
    requirements: {
      mip: { required: true, name: 'Mandatory Information Program', hours: 2.5 },
      financialDisclosure: { required: true, form: 'Form 13 or Form 13.1' }
    },
    keyProcesses: [
      { id: 'case-conference', name: 'Case Conference', description: 'First court appearance to identify issues' },
      { id: 'settlement-conference', name: 'Settlement Conference', description: 'Attempt to settle before trial' },
      { id: 'trial-management', name: 'Trial Management Conference', description: 'Final preparation for trial' }
    ],
    courtLocations: [
      { city: 'Toronto', address: '393 University Ave', phone: '416-327-5400', primary: true },
      { city: 'Ottawa', address: '161 Elgin St', phone: '613-239-1200' },
      { city: 'Hamilton', address: '45 Main St E', phone: '905-645-5252' },
      { city: 'London', address: '80 Dundas St', phone: '519-660-3090' }
    ],
    resources: {
      selfHelp: 'https://stepstojustice.ca/legal-topic/family-law',
      flic: 'https://www.ontario.ca/page/family-law-information-centres',
      legalAid: 'https://www.legalaid.on.ca'
    }
  },

  bc: {
    id: 'bc',
    name: 'British Columbia',
    shortName: 'BC',
    country: 'Canada',
    flag: '🇨🇦',
    status: 'live',
    court: {
      name: 'Supreme Court of British Columbia',
      familyDivision: 'Family Law',
      alternativeCourt: 'Provincial Court of British Columbia',
      website: 'https://www.bccourts.ca'
    },
    legislation: [
      { name: 'Family Law Act', shortName: 'FLA', url: 'https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/11025_00' },
      { name: 'Divorce Act (Federal)', shortName: 'DA', url: 'https://laws-lois.justice.gc.ca/eng/acts/D-3.4/' }
    ],
    fees: {
      provincial: 0,
      supreme: 200,
      motion: 80
    },
    courtChoice: {
      provincial: 'Parenting and child support matters (no divorce)',
      supreme: 'Divorce, property division, and all family matters'
    },
    requirements: {
      parentingCourse: { required: true, name: 'Parenting After Separation', hours: 3, online: true }
    },
    resources: {
      selfHelp: 'https://family.legalaid.bc.ca',
      clicklaw: 'https://www.clicklaw.bc.ca/helpmap/service/family',
      jpc: 'https://www.justicebc.ca/en/family'
    }
  },

  manitoba: {
    id: 'manitoba',
    name: 'Manitoba',
    shortName: 'MB',
    country: 'Canada',
    flag: '🇨🇦',
    status: 'beta',
    court: {
      name: 'Court of King\'s Bench',
      familyDivision: 'Family Division',
      website: 'https://www.manitobacourts.mb.ca'
    },
    legislation: [
      { name: 'Family Maintenance Act', shortName: 'FMA', url: 'https://web2.gov.mb.ca/laws/statutes/ccsm/f020e.php' },
      { name: 'Divorce Act (Federal)', shortName: 'DA', url: 'https://laws-lois.justice.gc.ca/eng/acts/D-3.4/' }
    ],
    fees: {
      petition: 200,
      motion: 100
    },
    requirements: {
      parentingProgram: { required: false, name: 'For the Sake of the Children' }
    }
  },

  // ==========================================
  // CANADA - NEW JURISDICTIONS
  // ==========================================

  quebec: {
    id: 'quebec',
    name: 'Quebec',
    shortName: 'QC',
    country: 'Canada',
    flag: '🇨🇦',
    status: 'beta',
    language: ['French', 'English'],
    legalSystem: 'Civil Law',
    court: {
      name: 'Superior Court of Quebec',
      familyDivision: 'Family Division',
      frenchName: 'Cour supérieure du Québec',
      website: 'https://courdappelduquebec.ca'
    },
    legislation: [
      { name: 'Civil Code of Quebec', shortName: 'CCQ', frenchName: 'Code civil du Québec', url: 'https://www.legisquebec.gouv.qc.ca/en/document/cs/CCQ-1991' },
      { name: 'Code of Civil Procedure', shortName: 'CCP', frenchName: 'Code de procédure civile', url: 'https://www.legisquebec.gouv.qc.ca/en/document/cs/C-25.01' },
      { name: 'Divorce Act (Federal)', shortName: 'DA', frenchName: 'Loi sur le divorce', url: 'https://laws-lois.justice.gc.ca/fra/lois/D-3.4/' }
    ],
    fees: {
      application: 316,
      motion: 87,
      divorce: 316
    },
    timelines: {
      responseTime: 15,
      internationalResponse: 30
    },
    requirements: {
      mediation: { 
        required: true, 
        name: 'Mandatory Mediation Information Session',
        frenchName: 'Séance d\'information sur la médiation familiale',
        description: 'Parents must attend a free information session about mediation'
      },
      parentingPlan: { 
        required: true, 
        name: 'Parenting Plan',
        frenchName: 'Plan parental'
      }
    },
    keyProcesses: [
      { id: 'mediation-session', name: 'Mediation Information Session', description: 'Free mandatory session explaining mediation' },
      { id: 'case-management', name: 'Case Management Conference', description: 'Conference de gestion' },
      { id: 'settlement', name: 'Settlement Conference', description: 'Conférence de règlement à l\'amiable' }
    ],
    courtLocations: [
      { city: 'Montreal', address: '1 Notre-Dame St E', phone: '514-393-2022', primary: true },
      { city: 'Quebec City', address: '300 Jean-Lesage Blvd', phone: '418-649-3400' },
      { city: 'Laval', address: '2800 Saint-Martin Blvd W', phone: '450-686-5200' },
      { city: 'Gatineau', address: '17 Laurier St', phone: '819-772-3019' }
    ],
    resources: {
      selfHelp: 'https://www.justice.gouv.qc.ca/en/couples-and-families',
      mediation: 'https://www.justice.gouv.qc.ca/en/couples-and-families/separation-and-divorce/family-mediation',
      legalAid: 'https://www.csj.qc.ca/commission-des-services-juridiques/aide-juridique-quebec/en',
      educaloi: 'https://educaloi.qc.ca/en/capsules/separation-and-divorce/'
    },
    childSupport: {
      guidelines: 'Quebec Model',
      note: 'Quebec uses its own child support model, different from federal guidelines',
      calculator: 'https://www.justice.gouv.qc.ca/en/couples-and-families/separation-and-divorce/child-support/calculation-of-child-support'
    },
    uniqueFeatures: [
      'Civil law system (different from common law in other provinces)',
      'Mandatory mediation information session',
      'Parental authority concept',
      'Quebec\'s own child support model'
    ]
  },

  nova_scotia: {
    id: 'nova_scotia',
    name: 'Nova Scotia',
    shortName: 'NS',
    country: 'Canada',
    flag: '🇨🇦',
    status: 'beta',
    court: {
      name: 'Supreme Court of Nova Scotia',
      familyDivision: 'Family Division',
      website: 'https://www.courts.ns.ca'
    },
    legislation: [
      { name: 'Parenting and Support Act', shortName: 'PSA', url: 'https://nslegislature.ca/legc/statutes/parenting%20and%20support.pdf' },
      { name: 'Maintenance and Custody Act', shortName: 'MCA', url: 'https://nslegislature.ca/sites/default/files/legc/statutes/maintenance%20and%20custody.pdf' },
      { name: 'Divorce Act (Federal)', shortName: 'DA', url: 'https://laws-lois.justice.gc.ca/eng/acts/D-3.4/' }
    ],
    fees: {
      application: 232.31,
      motion: 113.54,
      divorce: 232.31
    },
    timelines: {
      responseTime: 30,
      internationalResponse: 60
    },
    requirements: {
      parentingProgram: { 
        required: true, 
        name: 'Parent Information Program',
        hours: 3,
        online: true,
        description: 'Must complete before filing'
      },
      financialDisclosure: { required: true, form: 'Statement of Income' }
    },
    keyProcesses: [
      { id: 'conciliation', name: 'Conciliation', description: 'Required meeting with court staff' },
      { id: 'case-conference', name: 'Case Conference', description: 'Meeting with judge' },
      { id: 'settlement', name: 'Settlement Conference', description: 'Final settlement attempt' }
    ],
    courtLocations: [
      { city: 'Halifax', address: '1815 Upper Water St', phone: '902-424-4937', primary: true },
      { city: 'Sydney', address: '136 Charlotte St', phone: '902-563-2130' },
      { city: 'Dartmouth', address: '277 Pleasant St', phone: '902-424-4937' },
      { city: 'Kentville', address: '87 Cornwallis St', phone: '902-679-6070' }
    ],
    resources: {
      selfHelp: 'https://www.nsfamilylaw.ca',
      familyDivision: 'https://www.courts.ns.ca/supreme_court/family/index.htm',
      legalAid: 'https://www.nslegalaid.ca'
    },
    uniqueFeatures: [
      'Conciliation is mandatory',
      'Parent Information Program required before filing',
      'Strong emphasis on settlement'
    ]
  },

  // ==========================================
  // UNITED STATES - NEW
  // ==========================================

  california: {
    id: 'california',
    name: 'California',
    shortName: 'CA',
    country: 'United States',
    flag: '🇺🇸',
    status: 'coming_soon',
    court: {
      name: 'Superior Court of California',
      familyDivision: 'Family Law Division',
      website: 'https://www.courts.ca.gov'
    },
    legislation: [
      { name: 'California Family Code', shortName: 'FC', url: 'https://leginfo.legislature.ca.gov/faces/codesTOCSelected.xhtml?tocCode=FAM' }
    ],
    fees: {
      petition: 435,
      response: 435,
      motion: 60
    },
    timelines: {
      responseTime: 30,
      waitingPeriod: '6 months minimum for divorce'
    },
    requirements: {
      residency: '6 months in California, 3 months in county',
      parentingPlan: { required: true, name: 'Parenting Plan' },
      mediation: { required: true, name: 'Child Custody Mediation (for custody disputes)', courtOrdered: true }
    },
    keyProcesses: [
      { id: 'mediation', name: 'Child Custody Mediation', description: 'Required for custody/visitation disputes' },
      { id: 'mandatory-settlement', name: 'Mandatory Settlement Conference', description: 'Required before trial' }
    ],
    resources: {
      selfHelp: 'https://www.courts.ca.gov/selfhelp-family.htm',
      forms: 'https://www.courts.ca.gov/forms.htm?filter=FL'
    },
    childSupport: {
      guidelines: 'California Guideline Calculator',
      calculator: 'https://childsupport.ca.gov/guideline-calculator/'
    },
    uniqueFeatures: [
      'Community property state',
      '6-month waiting period for divorce',
      'Mandatory mediation for custody disputes',
      'Guideline child support calculation'
    ]
  },

  texas: {
    id: 'texas',
    name: 'Texas',
    shortName: 'TX',
    country: 'United States',
    flag: '🇺🇸',
    status: 'coming_soon',
    court: {
      name: 'District Court',
      familyDivision: 'Family District Court',
      website: 'https://www.txcourts.gov'
    },
    legislation: [
      { name: 'Texas Family Code', shortName: 'TFC', url: 'https://statutes.capitol.texas.gov/Docs/FA/htm/FA.1.htm' }
    ],
    fees: {
      petition: 300,
      response: 300,
      motion: 45
    },
    timelines: {
      responseTime: 20,
      waitingPeriod: '60 days minimum for divorce'
    },
    requirements: {
      residency: '6 months in Texas, 90 days in county',
      parentingCourse: { required: true, name: 'Parent Education Course', courtOrdered: true }
    },
    resources: {
      selfHelp: 'https://texaslawhelp.org/article/divorce-in-texas',
      forms: 'https://www.txcourts.gov/rules-forms/forms/'
    },
    childSupport: {
      guidelines: 'Texas Child Support Guidelines',
      percentage: '20% for one child, up to 40% for 5+ children'
    },
    uniqueFeatures: [
      'Community property state',
      '60-day waiting period',
      'No court approval needed for uncontested divorce',
      'Parent education course often required'
    ]
  },

  new_york: {
    id: 'new_york',
    name: 'New York',
    shortName: 'NY',
    country: 'United States',
    flag: '🇺🇸',
    status: 'coming_soon',
    court: {
      name: 'Supreme Court of New York',
      familyDivision: 'Matrimonial Part',
      alternativeCourt: 'Family Court',
      website: 'https://www.nycourts.gov'
    },
    legislation: [
      { name: 'New York Domestic Relations Law', shortName: 'DRL', url: 'https://www.nysenate.gov/legislation/laws/DOM' }
    ],
    fees: {
      divorce: 335,
      motion: 45,
      indexNumber: 210
    },
    timelines: {
      responseTime: 20,
      waitingPeriod: 'None for no-fault divorce'
    },
    requirements: {
      residency: '1 year if married in NY, 2 years otherwise',
      parentingCourse: { required: true, name: 'Parent Education Program', hours: 4, NYC: true }
    },
    courtChoice: {
      supreme: 'Divorce and all financial issues',
      family: 'Custody, visitation, child support, family offenses'
    },
    resources: {
      selfHelp: 'https://www.nycourts.gov/courthelp/family/index.shtml',
      forms: 'https://www.nycourts.gov/divorce/forms.shtml'
    },
    uniqueFeatures: [
      'No-fault divorce since 2010',
      'Equitable distribution (not community property)',
      'Parent education required in NYC',
      'Can file custody in Family Court without divorce'
    ]
  },

  florida: {
    id: 'florida',
    name: 'Florida',
    shortName: 'FL',
    country: 'United States',
    flag: '🇺🇸',
    status: 'coming_soon',
    court: {
      name: 'Circuit Court',
      familyDivision: 'Family Law Division',
      website: 'https://www.flcourts.org'
    },
    legislation: [
      { name: 'Florida Statutes Chapter 61', shortName: 'F.S. 61', url: 'http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0000-0099/0061/0061ContentsIndex.html' }
    ],
    fees: {
      petition: 409,
      response: 409,
      motion: 50
    },
    timelines: {
      responseTime: 20,
      waitingPeriod: '20 days minimum'
    },
    requirements: {
      residency: '6 months in Florida',
      parentingCourse: { required: true, name: 'Parent Education and Family Stabilization Course', hours: 4 },
      parentingPlan: { required: true, name: 'Parenting Plan' }
    },
    resources: {
      selfHelp: 'https://www.flcourts.org/Resources-Services/Family-Courts/Family-Law-Self-Help-Information',
      forms: 'https://www.flcourts.org/Resources-Services/Court-Improvement/Family-Courts/Family-Law-Forms'
    },
    childSupport: {
      guidelines: 'Florida Child Support Guidelines',
      calculator: 'https://flchildsupportcalculator.com'
    },
    uniqueFeatures: [
      'No permanent alimony (reformed 2023)',
      '50/50 custody presumption',
      'Mandatory parenting plan',
      'Simplified dissolution for short marriages without children'
    ]
  },

  washington: {
    id: 'washington',
    name: 'Washington',
    shortName: 'WA',
    country: 'United States',
    flag: '🇺🇸',
    status: 'coming_soon',
    court: {
      name: 'Superior Court',
      familyDivision: 'Family Law',
      website: 'https://www.courts.wa.gov'
    },
    legislation: [
      { name: 'Revised Code of Washington Title 26', shortName: 'RCW 26', url: 'https://apps.leg.wa.gov/rcw/default.aspx?Cite=26' }
    ],
    fees: {
      petition: 314,
      response: 314,
      motion: 36
    },
    timelines: {
      responseTime: 20,
      waitingPeriod: '90 days minimum'
    },
    requirements: {
      residency: 'Petitioner must be Washington resident',
      parentingPlan: { required: true, name: 'Parenting Plan', detailed: true }
    },
    resources: {
      selfHelp: 'https://www.courts.wa.gov/newsinfo/resources/?fa=newsinfo_resources.display&altMenu=famRes',
      forms: 'https://www.courts.wa.gov/forms/?fa=forms.static&staticID=14'
    },
    uniqueFeatures: [
      'Community property state',
      '90-day waiting period',
      'Detailed parenting plan required',
      'No fault divorce only'
    ]
  }
};

// ============================================
// FILING PHASES BY JURISDICTION TYPE
// ============================================

export const FILING_PHASES_CANADA = [
  {
    id: 'pre-filing',
    name: 'Pre-Filing Requirements',
    steps: [
      { id: 'fdr', name: 'Complete Family Dispute Resolution/Mediation', required: 'varies' },
      { id: 'parenting-course', name: 'Complete Parenting Course', required: 'varies' },
      { id: 'gather-docs', name: 'Gather Financial Documents', required: true }
    ]
  },
  {
    id: 'filing',
    name: 'Initial Filing',
    steps: [
      { id: 'prepare-petition', name: 'Prepare Petition/Application', required: true },
      { id: 'financial-statement', name: 'Complete Financial Statement', required: true },
      { id: 'affidavit', name: 'Prepare Supporting Affidavit', required: true },
      { id: 'file-court', name: 'File Documents with Court', required: true }
    ]
  },
  {
    id: 'service',
    name: 'Service',
    steps: [
      { id: 'serve-respondent', name: 'Serve the Respondent', required: true },
      { id: 'proof-service', name: 'File Proof of Service', required: true }
    ]
  },
  {
    id: 'conference',
    name: 'Case Conference',
    steps: [
      { id: 'request-conference', name: 'Request Case/Judicial Conference', required: true },
      { id: 'prepare-brief', name: 'Prepare Conference Brief', required: true },
      { id: 'attend-conference', name: 'Attend Conference', required: true }
    ]
  },
  {
    id: 'resolution',
    name: 'Resolution',
    steps: [
      { id: 'negotiate', name: 'Negotiate Settlement', required: false },
      { id: 'draft-agreement', name: 'Draft Consent Agreement', required: false },
      { id: 'trial-prep', name: 'Trial Preparation (if needed)', required: false },
      { id: 'final-order', name: 'Obtain Final Order', required: true }
    ]
  }
];

export const FILING_PHASES_US = [
  {
    id: 'pre-filing',
    name: 'Pre-Filing Requirements',
    steps: [
      { id: 'residency', name: 'Confirm Residency Requirements', required: true },
      { id: 'parenting-course', name: 'Complete Parent Education (if required)', required: 'varies' },
      { id: 'gather-docs', name: 'Gather Financial Documents', required: true }
    ]
  },
  {
    id: 'filing',
    name: 'Initial Filing',
    steps: [
      { id: 'petition', name: 'Prepare and File Petition', required: true },
      { id: 'financial-disclosure', name: 'Complete Financial Disclosure', required: true },
      { id: 'parenting-plan', name: 'Prepare Parenting Plan', required: 'varies' }
    ]
  },
  {
    id: 'service',
    name: 'Service of Process',
    steps: [
      { id: 'serve-respondent', name: 'Serve the Respondent', required: true },
      { id: 'proof-service', name: 'File Proof of Service', required: true },
      { id: 'wait-response', name: 'Wait for Response Period', required: true }
    ]
  },
  {
    id: 'waiting',
    name: 'Waiting Period',
    steps: [
      { id: 'mandatory-wait', name: 'Complete Mandatory Waiting Period', required: 'varies' },
      { id: 'mediation', name: 'Complete Mediation (if required)', required: 'varies' }
    ]
  },
  {
    id: 'resolution',
    name: 'Resolution',
    steps: [
      { id: 'settlement-conference', name: 'Mandatory Settlement Conference', required: 'varies' },
      { id: 'negotiate', name: 'Negotiate Settlement', required: false },
      { id: 'trial', name: 'Trial (if needed)', required: false },
      { id: 'final-judgment', name: 'Obtain Final Judgment', required: true }
    ]
  }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export const jurisdictionService = {
  /**
   * Get all jurisdictions
   */
  getAll() {
    return Object.values(JURISDICTIONS);
  },

  /**
   * Get jurisdictions by country
   */
  getByCountry(country) {
    return Object.values(JURISDICTIONS).filter(j => j.country === country);
  },

  /**
   * Get jurisdictions by status
   */
  getByStatus(status) {
    return Object.values(JURISDICTIONS).filter(j => j.status === status);
  },

  /**
   * Get live jurisdictions
   */
  getLive() {
    return this.getByStatus('live');
  },

  /**
   * Get jurisdiction by ID
   */
  getById(id) {
    return JURISDICTIONS[id] || null;
  },

  /**
   * Get filing phases for jurisdiction
   */
  getFilingPhases(jurisdictionId) {
    const jurisdiction = JURISDICTIONS[jurisdictionId];
    if (!jurisdiction) return [];
    
    return jurisdiction.country === 'Canada' 
      ? FILING_PHASES_CANADA 
      : FILING_PHASES_US;
  },

  /**
   * Search jurisdictions
   */
  search(query) {
    const lowerQuery = query.toLowerCase();
    return Object.values(JURISDICTIONS).filter(j =>
      j.name.toLowerCase().includes(lowerQuery) ||
      j.shortName.toLowerCase().includes(lowerQuery) ||
      j.country.toLowerCase().includes(lowerQuery)
    );
  },

  /**
   * Get grouped by country
   */
  getGroupedByCountry() {
    const grouped = {};
    Object.values(JURISDICTIONS).forEach(j => {
      if (!grouped[j.country]) {
        grouped[j.country] = [];
      }
      grouped[j.country].push(j);
    });
    return grouped;
  }
};

// ============================================
// DATABASE SEED SQL
// ============================================

export const jurisdictionsSeedSQL = `
-- Clear existing jurisdictions
DELETE FROM jurisdictions;

-- Insert all jurisdictions
INSERT INTO jurisdictions (id, name, country, flag, status, court_name, filing_fees, response_time_days, legislation, display_order) VALUES
-- Canada - Live
('saskatchewan', 'Saskatchewan', 'Canada', '🇨🇦', 'live', 'Court of King''s Bench', '{"contested": 300, "uncontested": 500}', 30, ARRAY['The Children''s Law Act, 2020', 'The Family Maintenance Act', 'Divorce Act'], 1),
('alberta', 'Alberta', 'Canada', '🇨🇦', 'live', 'Court of King''s Bench', '{"contested": 260, "uncontested": 400}', 30, ARRAY['Family Law Act', 'Divorce Act'], 2),
('ontario', 'Ontario', 'Canada', '🇨🇦', 'live', 'Superior Court of Justice', '{"application": 202, "divorce": 400}', 30, ARRAY['Family Law Act', 'Children''s Law Reform Act', 'Divorce Act'], 3),
('bc', 'British Columbia', 'Canada', '🇨🇦', 'live', 'Supreme Court / Provincial Court', '{"provincial": 0, "supreme": 200}', 30, ARRAY['Family Law Act', 'Divorce Act'], 4),
('manitoba', 'Manitoba', 'Canada', '🇨🇦', 'beta', 'Court of King''s Bench', '{"petition": 200}', 30, ARRAY['Family Maintenance Act', 'Divorce Act'], 5),

-- Canada - Beta
('quebec', 'Quebec', 'Canada', '🇨🇦', 'beta', 'Superior Court of Quebec', '{"application": 316, "divorce": 316}', 15, ARRAY['Civil Code of Quebec', 'Code of Civil Procedure', 'Divorce Act'], 6),
('nova_scotia', 'Nova Scotia', 'Canada', '🇨🇦', 'beta', 'Supreme Court of Nova Scotia', '{"application": 232, "motion": 113}', 30, ARRAY['Parenting and Support Act', 'Maintenance and Custody Act', 'Divorce Act'], 7),

-- United States - Coming Soon
('california', 'California', 'United States', '🇺🇸', 'coming_soon', 'Superior Court of California', '{"petition": 435, "response": 435}', 30, ARRAY['California Family Code'], 101),
('texas', 'Texas', 'United States', '🇺🇸', 'coming_soon', 'District Court', '{"petition": 300, "response": 300}', 20, ARRAY['Texas Family Code'], 102),
('new_york', 'New York', 'United States', '🇺🇸', 'coming_soon', 'Supreme Court of New York', '{"divorce": 335, "motion": 45}', 20, ARRAY['New York Domestic Relations Law'], 103),
('florida', 'Florida', 'United States', '🇺🇸', 'coming_soon', 'Circuit Court', '{"petition": 409, "response": 409}', 20, ARRAY['Florida Statutes Chapter 61'], 104),
('washington', 'Washington', 'United States', '🇺🇸', 'coming_soon', 'Superior Court', '{"petition": 314, "response": 314}', 20, ARRAY['RCW Title 26'], 105);
`;

// ============================================
// EXPORTS
// ============================================

export default {
  JURISDICTIONS,
  FILING_PHASES_CANADA,
  FILING_PHASES_US,
  jurisdictionService,
  jurisdictionsSeedSQL
};
