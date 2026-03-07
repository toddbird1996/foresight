'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

// ============================================
// CPS / CHILD WELFARE LEGISLATION DATABASE
// ============================================
const LEGISLATION_DB = {
  saskatchewan: {
    jurisdiction: 'Saskatchewan',
    flag: '🇨🇦',
    status: 'live',
    actName: 'The Child and Family Services Act (C-7.2)',
    agency: 'Ministry of Social Services',
    legislationUrl: 'https://www.canlii.org/en/sk/laws/stat/ss-1989-90-c-c-7.2/latest/ss-1989-90-c-c-7.2.html',
    pdfUrl: 'https://pubsaskdev.blob.core.windows.net/pubsask-prod/561/C7-2.pdf',
    regulationsUrl: 'https://www.canlii.org/en/sk/laws/regu/rrs-c-c-7.2-reg-1/',
    advocatePhone: '1-800-322-7221',
    advocateName: 'Saskatchewan Advocate for Children and Youth',
    legalAidPhone: '1-800-667-3764',
    emergencyLine: '911',
    sections: [
      {
        id: 'investigation',
        title: 'Your Rights During an Investigation',
        icon: '🔍',
        rights: [
          { right: 'You must be notified of the investigation', section: 'Section 14(1)(a)', detail: 'If an officer concludes your child is in need of protection, the officer must notify you in writing of their conclusion.' },
          { right: 'You have the right to consult a lawyer', section: 'Section 19(c)', detail: 'When your child is apprehended, the officer must inform you of the advisability of consulting legal counsel.' },
          { right: 'Officers must offer family services first', section: 'Section 14(1)(b)', detail: 'Before removing a child, the officer must offer family services to the parent. Removal is a last resort.' },
          { right: 'You can agree to voluntary services', section: 'Section 14(2)', detail: 'If you acknowledge the need for family services and agree, the director may enter into an agreement with you rather than proceeding to court.' },
          { right: 'Investigations must be based on specific grounds', section: 'Section 11', detail: 'Anyone who has reasonable grounds to believe a child is in need of protection must report it, but the investigation must be grounded in evidence, not speculation.' },
          { right: 'Officers need a warrant to enter your home (with exceptions)', section: 'Section 13', detail: 'An officer generally needs a warrant to enter your home. Without a warrant, entry is only permitted if there are reasonable grounds to believe the child is in immediate danger.' },
        ]
      },
      {
        id: 'apprehension',
        title: 'Your Rights During an Apprehension',
        icon: '⚠️',
        rights: [
          { right: 'You must be notified of the grounds for apprehension', section: 'Section 19(a)', detail: 'The officer must tell you the specific reasons why your child was apprehended.' },
          { right: 'You must receive the officer\'s contact information', section: 'Section 19(b)', detail: 'The officer must provide you with their office address and telephone number.' },
          { right: 'You must be told to get a lawyer', section: 'Section 19(c)', detail: 'The officer must inform you of the advisability of consulting legal counsel.' },
          { right: 'A protection hearing must occur within prescribed timelines', section: 'Section 22', detail: 'After apprehension, the matter must be brought before the court for a protection hearing within the timelines set by the Act.' },
          { right: 'Your child should be returned if grounds no longer exist', section: 'Section 17(3)', detail: 'If the officer determines the child is no longer in need of protection, the child must be returned.' },
          { right: 'Placement priority goes to family', section: 'Section 53(1)', detail: 'Priority must be given to placing the child with a parent, extended family member, or in an environment consistent with the child\'s cultural background.' },
        ]
      },
      {
        id: 'court',
        title: 'Your Rights in Court Proceedings',
        icon: '⚖️',
        rights: [
          { right: 'You have the right to legal representation', section: 'General', detail: 'You can hire a lawyer or apply for Legal Aid Saskatchewan (1-800-667-3764) if you cannot afford one.' },
          { right: 'Children have the right to counsel', section: 'Counsel for Children Program', detail: 'Children and youth involved in child protection proceedings can have a lawyer appointed through the Counsel for Children program.' },
          { right: 'The best interests of the child is the paramount consideration', section: 'Section 4', detail: 'All decisions must be based on the best interests of the child, considering physical, emotional, psychological needs and cultural heritage.' },
          { right: 'You can challenge the apprehension in court', section: 'Section 22', detail: 'You have the right to appear at the protection hearing and present your case for why your child should be returned.' },
          { right: 'You can appeal court decisions', section: 'General', detail: 'You have the right to appeal any order made under the Act to a higher court.' },
        ]
      },
      {
        id: 'access',
        title: 'Your Rights to Access & Visits',
        icon: '👨‍👩‍👧',
        rights: [
          { right: 'You may have access to your child while in care', section: 'Section 39', detail: 'The Act contains provisions regarding access by parents or guardians to children who are temporary or permanent wards.' },
          { right: 'Family services must be offered after return', section: 'Section 21', detail: 'If your child is returned, the officer must offer family services if the child continues to be in need of protection.' },
          { right: 'Agreements have time limits', section: 'Section 14', detail: 'Voluntary agreements for services cannot exceed 24 months total, unless the director determines it is in the child\'s best interests.' },
        ]
      },
      {
        id: 'indigenous',
        title: 'Indigenous Family Rights',
        icon: '🪶',
        rights: [
          { right: 'Cultural placement priority', section: 'Section 53(1)(c)', detail: 'Priority must be given to placing the child in an environment consistent with the child\'s cultural background.' },
          { right: 'Extended family and community connections', section: 'Section 53(1)(b)', detail: 'Priority must be given to placing the child with a member of the child\'s extended family.' },
          { right: 'Indigenous governing bodies may be involved', section: '2023 Amendments', detail: 'Recent amendments recognize the role of Indigenous governing bodies in child welfare decisions.' },
          { right: 'Right to cultural identity', section: 'Section 4', detail: 'The child\'s cultural, linguistic, and spiritual heritage must be considered in all decisions.' },
        ]
      },
      {
        id: 'complaints',
        title: 'How to File a Complaint',
        icon: '📋',
        rights: [
          { right: 'Contact the Saskatchewan Advocate for Children and Youth', section: 'The Advocate for Children and Youth Act', detail: 'The Advocate can investigate complaints about services provided under the Child and Family Services Act. Call 1-800-322-7221.' },
          { right: 'Request a review of decisions', section: 'General', detail: 'You can request a review of any decision made by the Ministry of Social Services regarding your child.' },
          { right: 'File a complaint with the Ministry', section: 'General', detail: 'Contact the Ministry of Social Services directly to file a formal complaint about a caseworker or agency.' },
        ]
      }
    ]
  },
  alberta: {
    jurisdiction: 'Alberta',
    flag: '🇨🇦',
    status: 'live',
    actName: 'Child, Youth and Family Enhancement Act (Chapter C-12)',
    agency: 'Ministry of Children and Family Services',
    legislationUrl: 'https://www.canlii.org/en/ab/laws/stat/rsa-2000-c-c-12/latest/rsa-2000-c-c-12.html',
    pdfUrl: 'https://kings-printer.alberta.ca/documents/Acts/C12.pdf',
    regulationsUrl: 'https://www.canlii.org/en/ab/laws/regu/alta-reg-160-2004/latest/',
    advocatePhone: '1-800-661-3446',
    advocateName: 'Office of the Child and Youth Advocate',
    legalAidPhone: '1-866-845-3425',
    emergencyLine: '911',
    sections: [
      {
        id: 'investigation', title: 'Your Rights During an Investigation', icon: '🔍',
        rights: [
          { right: 'You must be informed of the concerns', section: 'Section 4', detail: 'A director must assess whether a child is in need of intervention and inform the family of the concerns.' },
          { right: 'You have the right to consult a lawyer', section: 'General', detail: 'You can consult a lawyer at any stage. Contact Legal Aid Alberta at 1-866-845-3425.' },
          { right: 'The least disruptive measures must be used', section: 'Section 2(d)', detail: 'The Act requires that the least disruptive course of action that is in the child\'s best interest should be followed.' },
          { right: 'Family enhancement agreements can be offered', section: 'Section 8', detail: 'A director may enter into an enhancement agreement with you to provide services to keep your family together.' },
          { right: 'You can refuse entry without a warrant', section: 'Section 18', detail: 'An officer generally requires a court order to enter your home, unless there are reasonable grounds to believe a child is in immediate danger.' },
        ]
      },
      {
        id: 'apprehension', title: 'Your Rights During an Apprehension', icon: '⚠️',
        rights: [
          { right: 'You must be told the reasons for apprehension', section: 'Section 19', detail: 'After apprehension, a director must inform the guardian of the reasons and the right to legal counsel.' },
          { right: 'A court hearing must be held within specific timelines', section: 'Section 21', detail: 'An application for a supervision or temporary guardianship order must be filed promptly after apprehension.' },
          { right: 'Your child should be placed with family when possible', section: 'Section 2(e)', detail: 'Placement priority goes to the child\'s extended family or community when appropriate.' },
          { right: 'You can apply to have your child returned', section: 'Section 24', detail: 'You can apply to the court for the return of your child if circumstances have changed.' },
        ]
      },
      {
        id: 'court', title: 'Your Rights in Court', icon: '⚖️',
        rights: [
          { right: 'You can challenge any order', section: 'General', detail: 'You have the right to contest any application made by the director and present your own evidence.' },
          { right: 'Children can appeal court decisions', section: 'Section 116', detail: 'Children of any age have the right to appeal court decisions made under the Act.' },
          { right: 'You can appeal to the Appeals Panel', section: 'Section 120', detail: 'Decisions made by directors can be appealed to the Appeals Panel.' },
        ]
      },
      {
        id: 'complaints', title: 'How to File a Complaint', icon: '📋',
        rights: [
          { right: 'Contact the Child and Youth Advocate', section: 'Child and Youth Advocate Act', detail: 'The Advocate investigates complaints about child intervention services. Call 1-800-661-3446.' },
          { right: 'Appeal a director\'s decision', section: 'Section 120', detail: 'You can appeal decisions to the Appeals Panel within 30 days.' },
        ]
      }
    ]
  },
  ontario: {
    jurisdiction: 'Ontario',
    flag: '🇨🇦',
    status: 'live',
    actName: 'Child, Youth and Family Services Act, 2017 (S.O. 2017, c.14)',
    agency: 'Ministry of Children, Community and Social Services',
    legislationUrl: 'https://www.canlii.org/en/on/laws/stat/so-2017-c-14-sch-1/latest/',
    pdfUrl: 'https://www.ontario.ca/laws/statute/17c14',
    regulationsUrl: '',
    advocatePhone: '1-800-263-2841',
    advocateName: 'Ontario Ombudsman (Child Welfare)',
    legalAidPhone: '1-800-668-8258',
    emergencyLine: '911',
    sections: [
      {
        id: 'investigation', title: 'Your Rights During an Investigation', icon: '🔍',
        rights: [
          { right: 'You must be informed that a Children\'s Aid Society is investigating', section: 'Section 81', detail: 'A society must investigate allegations that a child is in need of protection and inform the family.' },
          { right: 'You can consult a lawyer before and during any interview', section: 'General', detail: 'Contact Legal Aid Ontario at 1-800-668-8258 for free legal assistance.' },
          { right: 'A warrant is generally required to enter your home', section: 'Section 84', detail: 'A CAS worker needs a warrant to enter, unless there are reasonable grounds to believe a child is in immediate danger.' },
          { right: 'Voluntary services must be considered first', section: 'Section 80', detail: 'A society must consider providing services to keep the family together before seeking court intervention.' },
        ]
      },
      {
        id: 'apprehension', title: 'Your Rights During an Apprehension', icon: '⚠️',
        rights: [
          { right: 'You must be told the reasons', section: 'Section 85', detail: 'The CAS must inform you of the reasons for apprehension and your right to a lawyer.' },
          { right: 'A court hearing within 5 days', section: 'Section 86', detail: 'The child must be brought before the court within 5 days of apprehension.' },
          { right: 'Placement with family is preferred', section: 'Section 96', detail: 'The society must consider placing the child with a relative, member of the community, or another suitable person.' },
          { right: 'Indigenous community must be notified', section: 'Section 87', detail: 'If the child is Indigenous, the relevant First Nation, Inuit, or Métis community must be notified.' },
        ]
      },
      {
        id: 'court', title: 'Your Rights in Court', icon: '⚖️',
        rights: [
          { right: 'You have the right to legal representation', section: 'Section 91', detail: 'You can have a lawyer represent you. The Office of the Children\'s Lawyer may also be appointed for the child.' },
          { right: 'You can contest any protection application', section: 'General', detail: 'You have full rights to present evidence, call witnesses, and cross-examine.' },
          { right: 'Court orders must be reviewed', section: 'Section 101', detail: 'Temporary orders must be reviewed within prescribed timelines.' },
        ]
      },
      {
        id: 'complaints', title: 'How to File a Complaint', icon: '📋',
        rights: [
          { right: 'Contact the Ontario Ombudsman', section: 'Ombudsman Act', detail: 'The Ombudsman oversees Children\'s Aid Societies. Call 1-800-263-2841.' },
          { right: 'Internal complaint to the CAS', section: 'General', detail: 'Each CAS must have an internal complaint process. Ask for their complaints procedure.' },
        ]
      }
    ]
  },
  bc: {
    jurisdiction: 'British Columbia',
    flag: '🇨🇦',
    status: 'live',
    actName: 'Child, Family and Community Service Act (RSBC 1996, c.46)',
    agency: 'Ministry of Children and Family Development',
    legislationUrl: 'https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/96046_01',
    pdfUrl: 'https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/96046_01',
    regulationsUrl: '',
    advocatePhone: '1-800-476-3933',
    advocateName: 'Representative for Children and Youth',
    legalAidPhone: '1-866-577-2525',
    emergencyLine: '911',
    sections: [
      {
        id: 'investigation', title: 'Your Rights During an Investigation', icon: '🔍',
        rights: [
          { right: 'You must be notified of the investigation', section: 'Section 16', detail: 'A director who investigates must inform you of the concerns and the actions being considered.' },
          { right: 'You can consult a lawyer', section: 'General', detail: 'Contact Legal Aid BC at 1-866-577-2525 for free legal assistance.' },
          { right: 'Support services must be offered', section: 'Section 5', detail: 'The director must consider available support services for the family and less disruptive alternatives.' },
          { right: 'A warrant is needed to enter your home', section: 'Section 28', detail: 'A director needs a warrant unless the child is believed to be in immediate danger.' },
        ]
      },
      {
        id: 'apprehension', title: 'Your Rights During an Apprehension', icon: '⚠️',
        rights: [
          { right: 'You must be told the reasons and your rights', section: 'Section 31', detail: 'After removing a child, the director must promptly notify you of the reasons and inform you of your right to legal counsel.' },
          { right: 'Court presentation within 7 days', section: 'Section 33', detail: 'The director must present the matter to the court within 7 days of removing the child.' },
          { right: 'Kinship and cultural placement priority', section: 'Section 71', detail: 'Priority must be given to placing the child with family members or within their cultural community.' },
        ]
      },
      {
        id: 'court', title: 'Your Rights in Court', icon: '⚖️',
        rights: [
          { right: 'You have the right to contest the removal', section: 'Section 34', detail: 'You can appear at the protection hearing and present your case.' },
          { right: 'You can appeal any order', section: 'Section 82', detail: 'You have the right to appeal any order made under the Act.' },
        ]
      },
      {
        id: 'complaints', title: 'How to File a Complaint', icon: '📋',
        rights: [
          { right: 'Contact the Representative for Children and Youth', section: 'Representative for Children and Youth Act', detail: 'Independent advocate who can investigate complaints. Call 1-800-476-3933.' },
        ]
      }
    ]
  },
  manitoba: {
    jurisdiction: 'Manitoba',
    flag: '🇨🇦',
    status: 'live',
    actName: 'The Child and Family Services Act (C.C.S.M. c.C80)',
    agency: 'Department of Families',
    legislationUrl: 'https://web2.gov.mb.ca/laws/statutes/ccsm/c080.php',
    pdfUrl: 'https://web2.gov.mb.ca/laws/statutes/ccsm/c080.php',
    regulationsUrl: '',
    advocatePhone: '1-800-263-7146',
    advocateName: 'Manitoba Advocate for Children and Youth',
    legalAidPhone: '1-800-261-2960',
    emergencyLine: '911',
    sections: [
      {
        id: 'investigation', title: 'Your Rights During an Investigation', icon: '🔍',
        rights: [
          { right: 'The agency must investigate reports of abuse or neglect', section: 'Section 18', detail: 'An agency must promptly investigate any report that a child may be in need of protection.' },
          { right: 'You have the right to consult a lawyer', section: 'General', detail: 'Contact Legal Aid Manitoba at 1-800-261-2960.' },
          { right: 'Family support services must be offered', section: 'Section 7', detail: 'Agencies must provide or arrange for family support services to prevent children from coming into care.' },
        ]
      },
      {
        id: 'apprehension', title: 'Your Rights During an Apprehension', icon: '⚠️',
        rights: [
          { right: 'You must be notified of the apprehension', section: 'Section 24', detail: 'The agency must make reasonable efforts to notify parents or guardians of the apprehension.' },
          { right: 'Access to your child pending a hearing', section: 'Section 27', detail: 'The Act provides for access by parents to an apprehended child pending a child protection hearing.' },
          { right: 'A court hearing must be held within prescribed timelines', section: 'Section 27', detail: 'The agency must apply to the court for a hearing after apprehension.' },
        ]
      },
      {
        id: 'court', title: 'Your Rights in Court', icon: '⚖️',
        rights: [
          { right: 'Children over 12 have the right to be heard', section: 'Section 2(2)', detail: 'Children over 12 have the right to have their views and preferences known to the court.' },
          { right: 'Right to legal counsel', section: 'Section 34', detail: 'The Act provides for the right to counsel in child protection proceedings.' },
        ]
      },
      {
        id: 'complaints', title: 'How to File a Complaint', icon: '📋',
        rights: [
          { right: 'Contact the Manitoba Advocate for Children and Youth', section: 'The Advocate for Children and Youth Act', detail: 'Independent office that reviews child welfare services. Call 1-800-263-7146.' },
        ]
      }
    ]
  },
  quebec: {
    jurisdiction: 'Quebec',
    flag: '🇨🇦',
    status: 'live',
    actName: 'Youth Protection Act (Loi sur la protection de la jeunesse)',
    agency: 'Direction de la protection de la jeunesse (DPJ)',
    legislationUrl: 'https://www.legisquebec.gouv.qc.ca/en/document/cs/P-34.1',
    pdfUrl: 'https://www.legisquebec.gouv.qc.ca/en/document/cs/P-34.1',
    regulationsUrl: '',
    advocatePhone: '1-800-265-0779',
    advocateName: 'Commission des droits de la personne et des droits de la jeunesse',
    legalAidPhone: '514-842-2233',
    emergencyLine: '911',
    sections: [
      {
        id: 'investigation', title: 'Your Rights During an Investigation', icon: '🔍',
        rights: [
          { right: 'DPJ must assess the report within specific timelines', section: 'Section 32', detail: 'The DPJ must assess whether the child\'s security or development is compromised within prescribed timelines.' },
          { right: 'You have the right to consult a lawyer', section: 'Section 5', detail: 'Every person has the right to be assisted by a lawyer at every stage of the proceedings.' },
          { right: 'Voluntary measures must be considered first', section: 'Section 51', detail: 'The DPJ must consider voluntary measures and agreements with the family before resorting to court intervention.' },
        ]
      },
      {
        id: 'apprehension', title: 'Your Rights During an Apprehension', icon: '⚠️',
        rights: [
          { right: 'Emergency removal requires specific grounds', section: 'Section 46', detail: 'A child can only be removed immediately if their security or development is considered to be in danger.' },
          { right: 'You must be informed of the reasons', section: 'Section 48', detail: 'You must be notified of the reasons for the intervention and your rights.' },
          { right: 'Court hearing within specific timelines', section: 'Section 47', detail: 'The matter must be brought before the tribunal within prescribed timelines.' },
        ]
      },
      {
        id: 'court', title: 'Your Rights in Court', icon: '⚖️',
        rights: [
          { right: 'Right to be heard by the tribunal', section: 'Section 74', detail: 'All parties have the right to be heard and to present evidence at the tribunal hearing.' },
          { right: 'Right to appeal', section: 'Section 100', detail: 'You can appeal any decision of the tribunal to a higher court.' },
        ]
      },
      {
        id: 'complaints', title: 'How to File a Complaint', icon: '📋',
        rights: [
          { right: 'Contact the Commission des droits', section: 'General', detail: 'The Commission des droits de la personne et des droits de la jeunesse can investigate complaints. Call 1-800-265-0779.' },
          { right: 'Request a revision of a DPJ decision', section: 'Section 9', detail: 'You can request a revision of any decision made by the DPJ.' },
        ]
      }
    ]
  },
  nova_scotia: {
    jurisdiction: 'Nova Scotia',
    flag: '🇨🇦',
    status: 'live',
    actName: 'Children and Family Services Act (S.N.S. 1990, c.5)',
    agency: 'Department of Community Services',
    legislationUrl: 'https://www.canlii.org/en/ns/laws/stat/sns-1990-c-5/latest/',
    pdfUrl: 'https://www.canlii.org/en/ns/laws/stat/sns-1990-c-5/latest/',
    regulationsUrl: '',
    advocatePhone: '902-424-6070',
    advocateName: 'Nova Scotia Ombudsman',
    legalAidPhone: '902-420-6573',
    emergencyLine: '911',
    sections: [
      {
        id: 'investigation', title: 'Your Rights During an Investigation', icon: '🔍',
        rights: [
          { right: 'The agency must investigate reports', section: 'Section 24', detail: 'An agency must investigate any information that a child may be in need of protective services.' },
          { right: 'You have the right to a lawyer', section: 'General', detail: 'Contact Nova Scotia Legal Aid at 902-420-6573.' },
          { right: 'Services must be offered to keep the family together', section: 'Section 13', detail: 'The agency should provide protective services that support the family and prevent removal.' },
        ]
      },
      {
        id: 'apprehension', title: 'Your Rights During an Apprehension', icon: '⚠️',
        rights: [
          { right: 'You must be notified', section: 'Section 33', detail: 'The agency must notify you of the apprehension and the reasons for it.' },
          { right: 'A court hearing must occur promptly', section: 'Section 39', detail: 'The matter must be brought before the court within prescribed timelines after apprehension.' },
          { right: 'Placement with family is preferred', section: 'Section 42', detail: 'Priority is given to placing the child with a relative or within their community.' },
        ]
      },
      {
        id: 'complaints', title: 'How to File a Complaint', icon: '📋',
        rights: [
          { right: 'Contact the Nova Scotia Ombudsman', section: 'Ombudsman Act', detail: 'The Ombudsman can investigate complaints about government services. Call 902-424-6070.' },
        ]
      }
    ]
  },
  new_brunswick: {
    jurisdiction: 'New Brunswick',
    flag: '🇨🇦',
    status: 'live',
    actName: 'Family Services Act (S.N.B. 1980, c.F-2.2)',
    agency: 'Department of Social Development',
    legislationUrl: 'https://www.canlii.org/en/nb/laws/stat/snb-1980-c-f-2.2/latest/',
    pdfUrl: 'https://www.canlii.org/en/nb/laws/stat/snb-1980-c-f-2.2/latest/',
    regulationsUrl: '',
    advocatePhone: '1-888-465-1100',
    advocateName: 'New Brunswick Child and Youth Advocate',
    legalAidPhone: '1-800-442-4862',
    emergencyLine: '911',
    sections: [
      {
        id: 'investigation', title: 'Your Rights During an Investigation', icon: '🔍',
        rights: [
          { right: 'The Minister must investigate reports of abuse or neglect', section: 'Section 31', detail: 'The Minister must investigate where there is information that a child\'s security or development may be in danger.' },
          { right: 'You have the right to a lawyer', section: 'General', detail: 'Contact Legal Aid New Brunswick at 1-800-442-4862.' },
          { right: 'Support services must be considered', section: 'Section 34', detail: 'Voluntary agreements and support services must be considered before court intervention.' },
        ]
      },
      {
        id: 'apprehension', title: 'Your Rights During an Apprehension', icon: '⚠️',
        rights: [
          { right: 'You must be informed of the reasons', section: 'Section 36', detail: 'You must be notified of the grounds for removal and your right to counsel.' },
          { right: 'A court hearing must be held promptly', section: 'Section 37', detail: 'The matter must be brought before the court within prescribed timelines.' },
        ]
      },
      {
        id: 'complaints', title: 'How to File a Complaint', icon: '📋',
        rights: [
          { right: 'Contact the Child and Youth Advocate', section: 'Child and Youth Advocate Act', detail: 'Independent advocate who can investigate complaints. Call 1-888-465-1100.' },
        ]
      }
    ]
  },
  newfoundland: {
    jurisdiction: 'Newfoundland & Labrador',
    flag: '🇨🇦',
    status: 'live',
    actName: 'Children, Youth and Families Act (S.N.L. 2018, c.C-12.3)',
    agency: 'Department of Children, Seniors and Social Development',
    legislationUrl: 'https://www.canlii.org/en/nl/laws/stat/snl-2018-c-c-12.3/latest/',
    pdfUrl: 'https://www.canlii.org/en/nl/laws/stat/snl-2018-c-c-12.3/latest/',
    regulationsUrl: '',
    advocatePhone: '1-877-753-3840',
    advocateName: 'Office of the Child and Youth Advocate',
    legalAidPhone: '1-800-563-9911',
    emergencyLine: '911',
    sections: [
      {
        id: 'investigation', title: 'Your Rights During an Investigation', icon: '🔍',
        rights: [
          { right: 'A manager must assess reports', section: 'Section 14', detail: 'A manager must assess whether a child is in need of protective intervention.' },
          { right: 'You have the right to counsel', section: 'General', detail: 'Contact Legal Aid NL at 1-800-563-9911.' },
          { right: 'Voluntary services agreements are available', section: 'Section 15', detail: 'A manager may enter into agreements with families to provide support services.' },
        ]
      },
      {
        id: 'apprehension', title: 'Your Rights During an Apprehension', icon: '⚠️',
        rights: [
          { right: 'You must be notified', section: 'Section 20', detail: 'You must be informed of the apprehension and the reasons for it.' },
          { right: 'A hearing must occur within prescribed timelines', section: 'Section 22', detail: 'The matter must be brought before the court promptly.' },
        ]
      },
      {
        id: 'complaints', title: 'How to File a Complaint', icon: '📋',
        rights: [
          { right: 'Contact the Child and Youth Advocate', section: 'Advocate for Children and Youth Act', detail: 'Independent advocate who investigates complaints. Call 1-877-753-3840.' },
        ]
      }
    ]
  },
  pei: {
    jurisdiction: 'Prince Edward Island',
    flag: '🇨🇦',
    status: 'live',
    actName: 'Child Protection Act (R.S.P.E.I. 1988, c.C-5.1)',
    agency: 'Department of Social Development and Seniors',
    legislationUrl: 'https://www.canlii.org/en/pe/laws/stat/rspei-1988-c-c-5.1/latest/',
    pdfUrl: 'https://www.canlii.org/en/pe/laws/stat/rspei-1988-c-c-5.1/latest/',
    regulationsUrl: '',
    advocatePhone: '902-368-4500',
    advocateName: 'PEI Ombudsperson',
    legalAidPhone: '902-368-6043',
    emergencyLine: '911',
    sections: [
      {
        id: 'investigation', title: 'Your Rights During an Investigation', icon: '🔍',
        rights: [
          { right: 'The Director must investigate reports', section: 'Section 11', detail: 'The Director must investigate any report that a child may be in need of protection.' },
          { right: 'You have the right to a lawyer', section: 'General', detail: 'Contact Legal Aid PEI at 902-368-6043.' },
        ]
      },
      {
        id: 'apprehension', title: 'Your Rights During an Apprehension', icon: '⚠️',
        rights: [
          { right: 'You must be notified of the reasons', section: 'Section 22', detail: 'You must be informed of the apprehension and your right to counsel.' },
          { right: 'A court hearing must occur promptly', section: 'Section 25', detail: 'The child must be brought before the court within prescribed timelines.' },
        ]
      },
      {
        id: 'complaints', title: 'How to File a Complaint', icon: '📋',
        rights: [
          { right: 'Contact the PEI Ombudsperson', section: 'Ombudsperson Act', detail: 'Can investigate complaints about government services. Call 902-368-4500.' },
        ]
      }
    ]
  },
  northwest_territories: {
    jurisdiction: 'Northwest Territories',
    flag: '🇨🇦',
    status: 'live',
    actName: 'Child and Family Services Act (S.N.W.T. 1997, c.13)',
    agency: 'Department of Health and Social Services',
    legislationUrl: 'https://www.canlii.org/en/nt/laws/stat/snwt-1997-c-13/latest/',
    pdfUrl: 'https://www.justice.gov.nt.ca/en/files/legislation/child-family-services/child-family-services.a.pdf',
    regulationsUrl: '',
    advocatePhone: '867-920-8049',
    advocateName: 'NWT Information and Privacy Commissioner',
    legalAidPhone: '867-920-6356',
    emergencyLine: '911',
    sections: [
      {
        id: 'investigation', title: 'Your Rights During an Investigation', icon: '🔍',
        rights: [
          { right: 'A child protection worker must investigate reports', section: 'Section 9', detail: 'An investigation must be conducted when there are reasonable grounds to believe a child needs protection.' },
          { right: 'You have the right to a lawyer', section: 'General', detail: 'Contact Legal Aid NWT at 867-920-6356.' },
        ]
      },
      {
        id: 'apprehension', title: 'Your Rights During an Apprehension', icon: '⚠️',
        rights: [
          { right: 'You must be notified', section: 'Section 14', detail: 'You must be informed of the apprehension and the reasons.' },
          { right: 'A hearing must occur within prescribed timelines', section: 'Section 16', detail: 'The matter must be brought to court promptly.' },
        ]
      },
      {
        id: 'complaints', title: 'How to File a Complaint', icon: '📋',
        rights: [
          { right: 'File a complaint with the Department', section: 'General', detail: 'Contact the Department of Health and Social Services to file a formal complaint.' },
        ]
      }
    ]
  },
  yukon: {
    jurisdiction: 'Yukon',
    flag: '🇨🇦',
    status: 'live',
    actName: 'Child and Family Services Act (S.Y. 2008, c.1)',
    agency: 'Department of Health and Social Services',
    legislationUrl: 'https://www.canlii.org/en/yk/laws/stat/sy-2008-c-1/latest/',
    pdfUrl: 'https://www.canlii.org/en/yk/laws/stat/sy-2008-c-1/latest/',
    regulationsUrl: '',
    advocatePhone: '867-456-5575',
    advocateName: 'Yukon Child and Youth Advocate',
    legalAidPhone: '867-667-5210',
    emergencyLine: '911',
    sections: [
      {
        id: 'investigation', title: 'Your Rights During an Investigation', icon: '🔍',
        rights: [
          { right: 'A director must investigate reports', section: 'Section 21', detail: 'The director must investigate where there are reasonable grounds to believe a child needs protection.' },
          { right: 'You have the right to a lawyer', section: 'General', detail: 'Contact Yukon Legal Services at 867-667-5210.' },
          { right: 'Support services must be considered', section: 'Section 4', detail: 'Consideration must be given to providing services that support family unity.' },
        ]
      },
      {
        id: 'apprehension', title: 'Your Rights During an Apprehension', icon: '⚠️',
        rights: [
          { right: 'You must be notified of the reasons', section: 'Section 28', detail: 'You must be informed of the grounds for apprehension and your right to counsel.' },
          { right: 'A court hearing must occur promptly', section: 'Section 30', detail: 'The matter must be brought before the court within prescribed timelines.' },
        ]
      },
      {
        id: 'complaints', title: 'How to File a Complaint', icon: '📋',
        rights: [
          { right: 'Contact the Yukon Child and Youth Advocate', section: 'Child and Youth Advocate Act', detail: 'Independent advocate who can investigate complaints. Call 867-456-5575.' },
        ]
      }
    ]
  },
  nunavut: {
    jurisdiction: 'Nunavut',
    flag: '🇨🇦',
    status: 'live',
    actName: 'Child and Family Services Act (S.N.W.T. 1997, c.13, as adopted)',
    agency: 'Department of Family Services',
    legislationUrl: 'https://www.canlii.org/en/nu/laws/stat/snwt-nu-1997-c-13/latest/',
    pdfUrl: 'https://www.canlii.org/en/nu/laws/stat/snwt-nu-1997-c-13/latest/',
    regulationsUrl: '',
    advocatePhone: '867-975-5090',
    advocateName: 'Nunavut Representative for Children and Youth',
    legalAidPhone: '867-979-5377',
    emergencyLine: '911',
    sections: [
      {
        id: 'investigation', title: 'Your Rights During an Investigation', icon: '🔍',
        rights: [
          { right: 'A child protection worker must investigate', section: 'Section 9', detail: 'An investigation must be conducted when a child may need protection.' },
          { right: 'You have the right to a lawyer', section: 'General', detail: 'Contact Maliiganik Tukisiiniakvik Legal Aid at 867-979-5377. Available in Inuktitut and English.' },
          { right: 'Inuit cultural values must be considered', section: 'Section 2', detail: 'The Act requires consideration of Inuit societal values and cultural practices.' },
        ]
      },
      {
        id: 'apprehension', title: 'Your Rights During an Apprehension', icon: '⚠️',
        rights: [
          { right: 'You must be notified', section: 'Section 14', detail: 'You must be informed of the apprehension and your rights.' },
          { right: 'A hearing must occur within prescribed timelines', section: 'Section 16', detail: 'The matter must be brought to court promptly.' },
          { right: 'Community involvement in placement', section: 'Section 30', detail: 'The community should be involved in decisions about the child\'s placement.' },
        ]
      },
      {
        id: 'complaints', title: 'How to File a Complaint', icon: '📋',
        rights: [
          { right: 'Contact the Representative for Children and Youth', section: 'Representative for Children and Youth Act', detail: 'Independent advocate. Call 867-975-5090.' },
        ]
      }
    ]
  },
};

// Jurisdictions coming soon
const COMING_SOON = {
  canada: [],
  usa: 'Coming Soon — All 50 States'
};

// ============================================
// MAIN PAGE COMPONENT
// ============================================
export default function RightsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('saskatchewan');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const jurisdictionData = LEGISLATION_DB[selectedJurisdiction];

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/auth/login"); return; }
      setUser(user);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  const handleAIQuery = async () => {
    if (!aiInput.trim() || aiLoading) return;
    const userMsg = aiInput.trim();
    setAiInput('');
    setAiMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setAiLoading(true);

    try {
      const systemPrompt = `You are a legal information assistant for Foresight, specializing in child protection and family services law in ${jurisdictionData?.jurisdiction || 'Canada'}. 

Your knowledge base is ${jurisdictionData?.actName || 'child welfare legislation'}.

CRITICAL RULES:
1. You provide LEGAL INFORMATION, never legal advice. Always remind users to consult a lawyer.
2. Reference specific sections of the Act when possible.
3. Be empathetic — users are often in crisis situations involving their children.
4. If you don't know the answer, say so. Never make up legal information.
5. Focus on helping parents understand their rights and the process.
6. Keep responses concise but thorough.
7. Always suggest contacting Legal Aid (${jurisdictionData?.legalAidPhone || '1-800-667-3764'}) or the Advocate for Children and Youth (${jurisdictionData?.advocatePhone || ''}) when appropriate.

Key sections of the ${jurisdictionData?.actName || 'Act'}:
- Section 4: Best interests of the child
- Section 11: Duty to report
- Section 13: Warrant for access to child
- Section 14: Duty to offer family services
- Section 17: Apprehension
- Section 19: Notification requirements
- Section 21: Child returned
- Section 22: Protection hearings
- Section 37: Court orders
- Section 39: Access provisions
- Section 53: Priority of placement (family, extended family, cultural background)`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemPrompt,
          messages: [
            ...aiMessages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMsg }
          ]
        })
      });

      const data = await response.json();
      const assistantMsg = data.content?.map(c => c.text || '').join('') || 'I apologize, I was unable to process that request. Please try again.';
      setAiMessages(prev => [...prev, { role: 'assistant', content: assistantMsg }]);
    } catch (err) {
      console.error('AI error:', err);
      setAiMessages(prev => [...prev, { role: 'assistant', content: 'I apologize, there was an error processing your request. Please try again, or contact Legal Aid Saskatchewan at 1-800-667-3764 for immediate assistance.' }]);
    }
    setAiLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/dashboard" className="text-gray-400 hover:text-red-600 text-lg">←</Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Know Your Rights</h1>
              <p className="text-sm text-gray-500">CPS & Child Welfare — Simplified Codes & Regulations</p>
            </div>
          </div>

          {/* Jurisdiction Selector */}
          <select
            value={selectedJurisdiction}
            onChange={(e) => { setSelectedJurisdiction(e.target.value); setExpandedSection(null); setAiMessages([]); }}
            className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-gray-900 text-sm"
          >
            <optgroup label="🇨🇦 Canada">
              {Object.keys(LEGISLATION_DB).map(id => (
                <option key={id} value={id}>{LEGISLATION_DB[id].flag} {LEGISLATION_DB[id].jurisdiction}</option>
              ))}
            </optgroup>
            <optgroup label="🇺🇸 United States">
              <option disabled>🇺🇸 All 50 States — Coming Soon</option>
            </optgroup>
          </select>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {jurisdictionData ? (
          <>
            {/* Legislation Info Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🛡️</div>
                <div className="flex-1">
                  <h2 className="font-bold text-gray-900">{jurisdictionData.actName}</h2>
                  <p className="text-sm text-gray-500 mb-3">Administered by: {jurisdictionData.agency}</p>
                  <div className="flex flex-wrap gap-2">
                    <a href={jurisdictionData.legislationUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs bg-red-50 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                      📖 Read Full Act
                    </a>
                    <a href={jurisdictionData.pdfUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                      📄 Download PDF
                    </a>
                    {jurisdictionData.regulationsUrl && (
                      <a href={jurisdictionData.regulationsUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                        📋 Regulations
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <h3 className="font-semibold text-red-800 mb-2">📞 Important Contacts</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <a href={`tel:${jurisdictionData.legalAidPhone?.replace(/[^0-9+]/g, '')}`}
                  className="bg-white rounded-lg p-3 border border-red-200 hover:border-red-400 transition-colors">
                  <div className="font-medium text-gray-900">Legal Aid</div>
                  <div className="text-red-600">{jurisdictionData.legalAidPhone}</div>
                </a>
                <a href={`tel:${jurisdictionData.advocatePhone?.replace(/[^0-9+]/g, '')}`}
                  className="bg-white rounded-lg p-3 border border-red-200 hover:border-red-400 transition-colors">
                  <div className="font-medium text-gray-900">{jurisdictionData.advocateName}</div>
                  <div className="text-red-600">{jurisdictionData.advocatePhone}</div>
                </a>
                <a href="tel:911"
                  className="bg-white rounded-lg p-3 border border-red-200 hover:border-red-400 transition-colors">
                  <div className="font-medium text-gray-900">Emergency</div>
                  <div className="text-red-600">911</div>
                </a>
              </div>
            </div>

            {/* Rights Sections */}
            {jurisdictionData.sections.map(section => (
              <div key={section.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="text-2xl">{section.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{section.title}</h3>
                    <p className="text-sm text-gray-500">{section.rights.length} rights explained</p>
                  </div>
                  <span className="text-gray-400 text-lg">{expandedSection === section.id ? '▲' : '▼'}</span>
                </button>

                {expandedSection === section.id && (
                  <div className="border-t border-gray-100 p-4 space-y-3">
                    {section.rights.map((r, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start gap-3">
                          <span className="text-green-600 mt-0.5 font-bold flex-shrink-0">✓</span>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">{r.right}</h4>
                            <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded inline-block mb-2">{r.section}</span>
                            <p className="text-sm text-gray-600 leading-relaxed">{r.detail}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* AI Assistant Toggle */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <button
                onClick={() => setShowAI(!showAI)}
                className="w-full flex items-center gap-3 text-left"
              >
                <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white text-xl flex-shrink-0">🤖</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Ask AI About Your Rights</h3>
                  <p className="text-sm text-gray-500">Get plain-language answers about {jurisdictionData.actName}</p>
                </div>
                <span className="text-gray-400">{showAI ? '▲' : '▼'}</span>
              </button>

              {showAI && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  {/* Disclaimer */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-amber-700">
                      <strong>⚠️ Important:</strong> This AI provides general legal information about {jurisdictionData.actName}, not legal advice. 
                      Always consult a lawyer for your specific situation. Contact Legal Aid at {jurisdictionData.legalAidPhone}.
                    </p>
                  </div>

                  {/* Suggested Questions */}
                  {aiMessages.length === 0 && (
                    <div className="mb-4 space-y-2">
                      <p className="text-sm text-gray-600 font-medium">Suggested questions:</p>
                      {[
                        'Can CPS enter my home without a warrant?',
                        'What are my rights if my child is apprehended?',
                        'How long can they keep my child without a court hearing?',
                        'Can I refuse to let a caseworker interview my child?',
                        'What does "child in need of protection" actually mean?',
                      ].map((q, i) => (
                        <button
                          key={i}
                          onClick={() => { setAiInput(q); }}
                          className="block w-full text-left text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg px-3 py-2 transition-colors"
                        >
                          💬 {q}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* AI Messages */}
                  <div className="max-h-96 overflow-y-auto space-y-3 mb-3">
                    {aiMessages.map((msg, i) => (
                      <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'assistant' && (
                          <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">AI</div>
                        )}
                        <div className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm ${
                          msg.role === 'user'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    {aiLoading && (
                      <div className="flex gap-2.5">
                        <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">AI</div>
                        <div className="bg-gray-100 rounded-xl px-4 py-2.5">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* AI Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAIQuery()}
                      placeholder="Ask about your rights..."
                      className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-400"
                    />
                    <button
                      onClick={handleAIQuery}
                      disabled={!aiInput.trim() || aiLoading}
                      className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium disabled:opacity-40 transition-colors"
                    >
                      Ask
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Coming Soon */
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <span className="text-4xl block mb-3">🔜</span>
            <h3 className="font-bold text-gray-900 text-xl mb-2">Coming Soon</h3>
            <p className="text-gray-600 mb-6">
              Rights information for this jurisdiction is being researched and will be added soon.
            </p>
            <p className="text-sm text-gray-500">
              Currently available: Saskatchewan
            </p>
          </div>
        )}

        {/* USA Coming Soon */}
        <div className="bg-gray-100 border border-gray-200 rounded-xl p-6 text-center">
          <span className="text-3xl block mb-2">🇺🇸</span>
          <h3 className="font-bold text-gray-900 mb-2">United States — Coming Soon</h3>
          <p className="text-sm text-gray-600">
            CPS codes and regulations for all 50 US states are being researched and will be added in a future update.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h4 className="font-semibold text-amber-800 mb-1">⚠️ Important Disclaimer</h4>
          <p className="text-sm text-amber-700">
            This page provides simplified summaries of child welfare legislation for educational purposes only. 
            It is not legal advice. Laws change frequently — always verify with the current official legislation 
            and consult a qualified lawyer for your specific situation. If your child has been apprehended, 
            contact a lawyer immediately.
          </p>
        </div>
      </main>
    </div>
  );
}
