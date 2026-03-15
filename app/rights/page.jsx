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
      },
      {
        id: 'custody', title: 'Your Custody Rights', icon: '👨‍👩‍👧‍👦',
        rights: [
          { right: 'Both parents have equal rights to custody', section: "Children's Law Act, s.3", detail: 'Unless a court order says otherwise, both parents have equal rights to custody and decision-making for their children.' },
          { right: 'The child\'s best interests are paramount', section: "Children's Law Act, s.6", detail: 'Courts must consider the best interests of the child as the paramount consideration in all custody decisions. This includes the child\'s physical, emotional, and psychological needs.' },
          { right: 'You can apply for custody without a lawyer', section: 'Court of King\'s Bench Rules', detail: 'You have the right to represent yourself in custody proceedings. The court must treat self-represented litigants fairly.' },
          { right: 'Maximum contact principle', section: "Children's Law Act, s.6(2)", detail: 'Courts must consider the benefit of maximizing contact between the child and both parents when making custody orders.' },
          { right: 'You can request a custody evaluation', section: 'Court Practice', detail: 'Either parent can request the court order a custody and access assessment by a qualified professional.' },
          { right: 'Parenting after separation course is required', section: 'King\'s Bench Practice Directive', detail: 'Both parents must complete the "For the Sake of the Children" parenting program before a custody hearing.' },
        ]
      },
      {
        id: 'support', title: 'Your Child Support Rights', icon: '💰',
        rights: [
          { right: 'Both parents must support their children', section: 'Family Maintenance Act, s.4', detail: 'Both parents have a legal obligation to support their children. Support is the right of the child, not the parent.' },
          { right: 'Support follows Federal Guidelines', section: 'Federal Child Support Guidelines', detail: 'Child support in Saskatchewan is calculated using the Federal Child Support Guidelines tables based on the paying parent\'s gross income.' },
          { right: 'You can request financial disclosure', section: 'Family Maintenance Act, s.8.2', detail: 'You have the right to request complete financial disclosure from the other parent, including tax returns, pay stubs, and financial statements.' },
          { right: 'Support can be varied if circumstances change', section: 'Family Maintenance Act, s.10', detail: 'Either parent can apply to vary child support if there has been a material change in circumstances (job loss, income change, child aging out).' },
          { right: 'MEP enforces support orders', section: 'Enforcement of Maintenance Orders Act', detail: 'The Maintenance Enforcement Program (MEP) can enforce support orders by garnishing wages, seizing assets, suspending licenses, and more.' },
        ]
      },
      {
        id: 'relocation', title: 'Relocation & Travel Rights', icon: '✈️',
        rights: [
          { right: 'You must give notice before relocating', section: "Children's Law Act, s.6.1", detail: 'A parent planning to relocate must provide reasonable written notice to the other parent. Relocation can be contested in court.' },
          { right: 'Both parents must consent to international travel', section: 'General', detail: 'A child cannot be taken outside Canada without the consent of both parents or a court order. A consent letter is strongly recommended for any travel.' },
          { right: 'The court considers the impact on the child', section: "Children's Law Act, s.6", detail: 'When deciding relocation disputes, the court considers the impact on the child\'s relationship with the non-relocating parent.' },
          { right: 'You can apply for a travel restraining order', section: 'Court of King\'s Bench Rules', detail: 'If you believe the other parent may take your child out of the jurisdiction, you can apply for an urgent restraining order to prevent removal.' },
        ]
      },
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
          { right: 'You must be informed of the concerns', section: 'Section 4', detail: 'Anyone with reasonable and probable grounds to believe a child is in need of intervention must report. A director must then assess the situation and inform the family of the concerns.' },
          { right: 'You have the right to consult a lawyer immediately', section: 'Section 19(3)', detail: 'When a child is apprehended, notice must include the telephone number of the nearest Legal Aid office. You can consult a lawyer at any stage — contact Legal Aid Alberta at 1-866-845-3425.' },
          { right: 'The least disruptive measures must be used', section: 'Section 2(d)', detail: 'The Act specifically requires that "if a child is in need of protective services, the child should, if possible, receive those services in a manner that least disrupts the child."' },
          { right: 'Family enhancement agreements can be offered instead of court', section: 'Section 8', detail: 'A director may enter into a Family Enhancement Agreement with you to provide voluntary support services to keep your family together, without going to court.' },
          { right: 'You can refuse entry without a warrant', section: 'Section 18', detail: 'An officer generally requires a court order (Apprehension Order) to enter your home. Without a warrant, entry is only permitted if there are reasonable grounds to believe a child is in immediate danger.' },
          { right: 'Indigenous communities must be involved', section: 'Section 2(d)', detail: 'The Act states that Indigenous people should be involved in the planning and provision of services and decisions respecting Indigenous families and their children.' },
        ]
      },
      {
        id: 'apprehension', title: 'Your Rights During an Apprehension', icon: '⚠️',
        rights: [
          { right: 'You must be told the reasons and given Legal Aid\'s number', section: 'Section 19(3)', detail: 'Notice of apprehension must include a statement of the reasons AND the telephone number of the nearest Legal Aid office.' },
          { right: 'Apprehension Orders can be obtained without notice to you', section: 'Section 19(1)', detail: 'Be aware: CFS can apply for an Apprehension Order without giving you notice first (ex parte). However, a court must still review the order.' },
          { right: 'Court application within 2 days', section: 'Section 21(1)', detail: 'If a child is not returned within 2 days of apprehension, the director must apply to the court for an order (TGO, PGO, supervision, or other).' },
          { right: 'The court must hear the matter within 10 days', section: 'Section 21', detail: 'The initial court appearance must be scheduled within 10 days of the apprehension.' },
          { right: 'Your child should be placed with family', section: 'Section 2(e)', detail: 'The Act prioritizes placing children with immediate or extended family, then adoption, private guardianship, or supported independent living for youth.' },
          { right: 'You can apply to have your child returned at any time', section: 'Section 24', detail: 'You can apply to the court for the return of your child if circumstances have changed.' },
          { right: 'Maximum time limits on temporary guardianship', section: 'Section 33', detail: 'There are strict time limits on how long a child can be under Temporary Guardianship Orders. If the maximum is reached, the Director must apply for a Permanent Guardianship Order or return the child.' },
        ]
      },
      {
        id: 'court', title: 'Your Rights in Court', icon: '⚖️',
        rights: [
          { right: 'You can challenge any order made under the Act', section: 'General', detail: 'You have the right to contest any application made by the director, present your own evidence, call witnesses, and cross-examine.' },
          { right: 'Children of any age can appeal court decisions', section: 'Section 116', detail: 'Unlike many provinces, Alberta allows children of any age to appeal court decisions made under the Act.' },
          { right: 'You can appeal director\'s decisions to the Appeals Panel', section: 'Section 120', detail: 'Administrative decisions made by directors (not court orders) can be appealed to the Appeals Panel within 30 days.' },
          { right: 'You can access your child welfare file', section: 'Section 126(1)(b)', detail: 'A parent or guardian may request information from the Director relating to themselves and/or their child. If refused, you can apply under Section 126.11.' },
        ]
      },
      {
        id: 'access', title: 'Your Rights to Access & Visits', icon: '👨‍👩‍👧',
        rights: [
          { right: 'You may have access to your child while in temporary care', section: 'Section 34', detail: 'The court can include access provisions in any temporary guardianship order.' },
          { right: 'Access can be included in supervision orders', section: 'Section 32', detail: 'If a supervision order is made, it can include terms about your access to the child.' },
          { right: 'You can apply to vary access conditions', section: 'General', detail: 'You can apply to the court to change the terms of access if circumstances change.' },
        ]
      },
      {
        id: 'indigenous', title: 'Indigenous Family Rights', icon: '🪶',
        rights: [
          { right: 'Indigenous people must be involved in planning', section: 'Section 2(d)', detail: 'The Act specifically states that Indigenous people should be involved with respect to the planning and provision of services to and decisions respecting Indigenous families and their children.' },
          { right: 'Cultural connections must be maintained', section: 'Section 2(b)(iii)', detail: 'Children have the right to connections with their culture and cultural communities and opportunities to form those connections.' },
          { right: 'Delegated First Nations Agencies provide services on-reserve', section: 'General', detail: 'There are 19 Delegated First Nations Agencies in Alberta with authority to provide child intervention services to First Nations children on-reserve.' },
          { right: 'Federal Act may apply', section: 'An Act Respecting First Nations, Inuit and Métis Children', detail: 'If the child is a member of a First Nation, Inuit, or Métis community that has created its own child protection law, that Indigenous Law may prevail over the CYFEA.' },
        ]
      },
      {
        id: 'complaints', title: 'How to File a Complaint', icon: '📋',
        rights: [
          { right: 'Contact the Child and Youth Advocate', section: 'Child and Youth Advocate Act', detail: 'The Advocate investigates complaints about child intervention services and advocates for young people. Call 1-800-661-3446.' },
          { right: 'Appeal a director\'s decision to the Appeals Panel', section: 'Section 120', detail: 'You can appeal administrative decisions to the Appeals Panel within 30 days of the decision.' },
          { right: 'Request your child welfare records', section: 'Section 126', detail: 'You have the right to request access to your child welfare file. If denied, you can apply to the court under Section 126.11.' },
          { right: 'Contact the Alberta Ombudsman', section: 'Ombudsman Act', detail: 'The Ombudsman can investigate complaints about government services. Call 780-427-2756.' },
        ]
      },
      {
        id: 'custody', title: 'Your Custody Rights', icon: '👨‍👩‍👧‍👦',
        rights: [
          { right: 'Guardianship is the default for both parents', section: 'Family Law Act, s.20', detail: 'Both parents are guardians of their children by default, with equal rights to make decisions about health, education, and welfare.' },
          { right: 'Best interests of the child test', section: 'Family Law Act, s.18', detail: 'All parenting and contact orders must be in the best interests of the child, considering safety, relationships, and the child\'s views.' },
          { right: 'Parenting plans are encouraged', section: 'Family Law Act, s.39', detail: 'Courts encourage parents to develop parenting plans that address decision-making, living arrangements, and dispute resolution.' },
          { right: 'Children\'s views must be considered', section: 'Family Law Act, s.18(2)(f)', detail: 'The court must consider the child\'s views and preferences when making custody decisions, depending on the child\'s age and maturity.' },
          { right: 'You can request a parenting assessment', section: 'Family Law Act, s.47', detail: 'Either parent can request the court order a custody evaluation by a qualified assessor to help determine the best arrangement.' },
          { right: 'Mandatory parenting course', section: 'Court Practice', detail: 'Alberta requires both parents to complete the "Parenting After Separation" course before a custody hearing.' },
        ]
      },
      {
        id: 'support', title: 'Your Child Support Rights', icon: '💰',
        rights: [
          { right: 'Parents must provide for their children', section: 'Family Law Act, s.49', detail: 'Both parents have a duty to provide support for their children until age 18, or longer if the child is in full-time education.' },
          { right: 'Federal Guidelines apply', section: 'Family Law Act, s.51', detail: 'Child support is calculated using the Federal Child Support Guidelines based on gross annual income.' },
          { right: 'Full financial disclosure is required', section: 'Family Law Act, s.57', detail: 'Both parents must provide complete financial information including income, assets, and debts.' },
          { right: 'Special expenses are shared proportionally', section: 'Federal Guidelines, s.7', detail: 'Extraordinary expenses (childcare, medical, extracurricular, education) are shared between parents in proportion to their incomes.' },
          { right: 'MEP enforces orders automatically', section: 'Maintenance Enforcement Act', detail: 'All support orders are automatically filed with MEP for enforcement. MEP can garnish wages, intercept tax refunds, and suspend licenses.' },
        ]
      },
      {
        id: 'relocation', title: 'Relocation & Travel Rights', icon: '✈️',
        rights: [
          { right: '60 days notice required for relocation', section: 'Family Law Act, s.45', detail: 'A guardian must give at least 60 days written notice before relocating with a child, including the proposed new location and reasons.' },
          { right: 'The other parent can object', section: 'Family Law Act, s.45(4)', detail: 'The non-relocating parent has 30 days to file an objection with the court after receiving notice of relocation.' },
          { right: 'Court considers multiple factors', section: 'Family Law Act, s.46', detail: 'The court considers the reason for relocation, impact on the child, quality of relationships, and whether a revised parenting plan is feasible.' },
          { right: 'Travel restrictions can be ordered', section: 'Family Law Act, s.34', detail: 'The court can order that a child\'s passport be held by the court or that a parent not remove the child from a specified area.' },
        ]
      },
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
          { right: 'You must be informed of the CAS investigation', section: 'Section 81', detail: 'A Children\'s Aid Society (CAS) must investigate allegations that a child is in need of protection and inform the family of the concerns being investigated.' },
          { right: 'You can consult a lawyer before and during any interview', section: 'General', detail: 'You have the right to speak with a lawyer before answering questions. Contact Legal Aid Ontario at 1-800-668-8258 for free legal assistance.' },
          { right: 'A warrant is generally required to enter your home', section: 'Section 84', detail: 'A CAS worker needs a warrant to enter your home. Without a warrant, entry is only permitted if there are reasonable grounds to believe a child is at immediate risk of harm.' },
          { right: 'Voluntary services must be considered first', section: 'Section 80', detail: 'The CAS must consider providing services to keep the family together before seeking court intervention. Removal is meant to be a last resort.' },
          { right: 'You can refuse to sign a voluntary agreement', section: 'General', detail: 'You are not required to sign any voluntary service agreement. If you refuse, the CAS must go to court to obtain authority.' },
          { right: 'Investigations have time limits', section: 'Section 81', detail: 'The CAS must complete their investigation within a reasonable time and inform you of the outcome.' },
        ]
      },
      {
        id: 'apprehension', title: 'Your Rights During an Apprehension', icon: '⚠️',
        rights: [
          { right: 'You must be told the reasons for removal', section: 'Section 85', detail: 'The CAS must inform you of the specific reasons for apprehension and your right to a lawyer.' },
          { right: 'A court hearing within 5 days', section: 'Section 86', detail: 'The child must be brought before the court within 5 days of apprehension — one of the shortest timelines in Canada.' },
          { right: 'Placement with family is preferred', section: 'Section 96', detail: 'The CAS must consider placing the child with a relative, member of the community, or another suitable person before placing in foster care.' },
          { right: 'You can seek the child\'s return at the first hearing', section: 'Section 86', detail: 'At the first court appearance, you can argue for the child\'s return. The court can order the child returned with or without CAS supervision.' },
          { right: 'Indigenous community must be notified', section: 'Section 87', detail: 'If the child is First Nations, Inuit, or Métis, the relevant Indigenous community must be notified of the apprehension and entitled to participate.' },
        ]
      },
      {
        id: 'court', title: 'Your Rights in Court', icon: '⚖️',
        rights: [
          { right: 'You have the right to legal representation', section: 'Section 91', detail: 'You can have a lawyer represent you. If you cannot afford one, contact Legal Aid Ontario. The Office of the Children\'s Lawyer may also be appointed for the child.' },
          { right: 'You can contest any protection application', section: 'General', detail: 'You have full rights to present evidence, call witnesses, and cross-examine CAS witnesses.' },
          { right: 'Court orders must be reviewed', section: 'Section 101', detail: 'Temporary orders must be reviewed at regular intervals. You can also bring a motion to vary or terminate an order.' },
          { right: 'There are maximum time limits on court orders', section: 'Section 98', detail: 'The Act sets maximum time limits for how long a child can be in care. After the maximum, the child must either be returned or placed in extended society care.' },
          { right: 'You can appeal any order', section: 'General', detail: 'You have the right to appeal any order made under the Act to a higher court.' },
        ]
      },
      {
        id: 'access', title: 'Your Rights to Access & Visits', icon: '👨‍👩‍👧',
        rights: [
          { right: 'Access orders can be included in protection orders', section: 'Section 97', detail: 'The court can order access (visits) between you and your child while the child is in CAS care.' },
          { right: 'You can apply to vary access', section: 'General', detail: 'If your circumstances change, you can apply to the court to change the terms of your access.' },
          { right: 'The CAS must facilitate reasonable access', section: 'General', detail: 'Unless the court orders otherwise, the CAS must make reasonable efforts to facilitate your visits with your child.' },
        ]
      },
      {
        id: 'indigenous', title: 'Indigenous Family Rights', icon: '🪶',
        rights: [
          { right: 'Indigenous communities have the right to participate', section: 'Section 87', detail: 'First Nations, Inuit, and Métis communities must be notified and have the right to participate in protection proceedings involving their children.' },
          { right: 'Customary care must be considered', section: 'Section 96', detail: 'The CAS must consider customary care arrangements that are consistent with the child\'s Indigenous heritage.' },
          { right: 'Cultural continuity is a best interests factor', section: 'Section 74', detail: 'The child\'s cultural background, including Indigenous heritage, must be considered when determining best interests.' },
          { right: 'Indigenous child welfare agencies may have jurisdiction', section: 'Bill C-92', detail: 'The federal Act respecting First Nations, Inuit and Métis children may give Indigenous governing bodies jurisdiction over their own child and family services.' },
        ]
      },
      {
        id: 'complaints', title: 'How to File a Complaint', icon: '📋',
        rights: [
          { right: 'Contact the Ontario Ombudsman', section: 'Ombudsman Act', detail: 'The Ombudsman now oversees Children\'s Aid Societies. You can file a complaint about CAS conduct. Call 1-800-263-2841.' },
          { right: 'Internal complaint to the CAS', section: 'General', detail: 'Each CAS must have an internal complaint process. Ask for their formal complaints procedure in writing.' },
          { right: 'Contact your MPP', section: 'General', detail: 'Your Member of Provincial Parliament can raise concerns about CAS conduct on your behalf.' },
          { right: 'Request your CAS file', section: 'Section 283', detail: 'You have the right to request access to your own CAS records, subject to certain exceptions.' },
        ]
      },
      {
        id: 'custody', title: 'Your Custody Rights', icon: '👨‍👩‍👧‍👦',
        rights: [
          { right: 'Both parents have equal entitlement to custody', section: 'Children\'s Law Reform Act, s.20', detail: 'Unless a court order exists, both parents are equally entitled to custody of their children.' },
          { right: 'Best interests of the child is the only consideration', section: 'Children\'s Law Reform Act, s.24', detail: 'The court must consider only the best interests of the child, including the child\'s needs, relationships, views, and each parent\'s ability to care for the child.' },
          { right: 'The friendly parent principle', section: 'Children\'s Law Reform Act, s.24(2)(g)', detail: 'Courts consider which parent is more likely to encourage and support the child\'s relationship with the other parent.' },
          { right: 'Children\'s views matter', section: 'Children\'s Law Reform Act, s.24(2)(b)', detail: 'The court must consider the child\'s views and preferences if they can be reasonably determined.' },
          { right: 'You can represent yourself', section: 'Family Law Rules', detail: 'You have the right to represent yourself in all family court proceedings. The court must ensure self-represented litigants understand the process.' },
          { right: 'Mandatory Information Program', section: 'Family Law Rules, Rule 8.1', detail: 'Both parties must attend the Mandatory Information Program (MIP) within 45 days of filing. This covers mediation, the impact on children, and court procedures.' },
        ]
      },
      {
        id: 'support', title: 'Your Child Support Rights', icon: '💰',
        rights: [
          { right: 'Every parent must support their child', section: 'Family Law Act, s.31', detail: 'Every parent has an obligation to provide support for his or her unmarried child who is a minor or enrolled in full-time education.' },
          { right: 'Guidelines determine the amount', section: 'Child Support Guidelines', detail: 'Ontario uses the Federal Child Support Guidelines tables based on the paying parent\'s income and number of children.' },
          { right: 'Financial disclosure is mandatory', section: 'Family Law Rules, Rule 13', detail: 'Both parties must serve and file a financial statement (Form 13 or 13.1) sworn under oath with complete financial information.' },
          { right: 'FRO enforces support orders', section: 'Family Responsibility Office Act', detail: 'The Family Responsibility Office (FRO) enforces support orders and can garnish wages, suspend licenses, and report to credit bureaus.' },
          { right: 'Retroactive support can be ordered', section: 'Case Law', detail: 'Courts can order child support retroactively to the date it should have been paid, not just from the date of application.' },
        ]
      },
      {
        id: 'relocation', title: 'Relocation & Travel Rights', icon: '✈️',
        rights: [
          { right: 'Notice required for relocation', section: 'Children\'s Law Reform Act, s.39.1', detail: 'A parent who intends to relocate must provide at least 60 days written notice to the other parent with the proposed new location.' },
          { right: 'The relocating parent bears the burden', section: 'Case Law (Gordon v Goertz)', detail: 'The parent seeking to relocate bears the burden of proving the move is in the child\'s best interests.' },
          { right: 'Mobility rights are considered', section: 'Charter of Rights, s.6', detail: 'Parents have a constitutional right to mobility, but this must be balanced against the child\'s best interests.' },
          { right: 'Passport and travel orders', section: 'Children\'s Law Reform Act, s.36', detail: 'Courts can order that a child\'s passport be deposited with the court or that specific travel restrictions be put in place.' },
        ]
      },
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
          { right: 'You can consult a lawyer at any time', section: 'General', detail: 'Contact Legal Aid BC at 1-866-577-2525 for free legal assistance, including duty counsel at family court.' },
          { right: 'Support services must be offered first', section: 'Section 5', detail: 'The director must consider available support services for the family and less disruptive alternatives before removing a child.' },
          { right: 'A warrant is needed to enter your home', section: 'Section 28', detail: 'A director needs a court order to enter your home. Without one, entry is only permitted if the child is believed to be in immediate danger.' },
          { right: 'You can refuse to answer questions', section: 'General', detail: 'You are not legally required to answer questions from a social worker, though cooperation may be viewed favorably.' },
          { right: 'You can have a support person present', section: 'General', detail: 'You can have a friend, family member, or advocate present during any meeting with child welfare workers.' },
        ]
      },
      {
        id: 'apprehension', title: 'Your Rights During an Apprehension', icon: '⚠️',
        rights: [
          { right: 'You must be told the reasons and your rights', section: 'Section 31', detail: 'After removing a child, the director must promptly notify you of the specific reasons and inform you of your right to legal counsel.' },
          { right: 'Court presentation within 7 days', section: 'Section 33', detail: 'The director must present the matter to the Provincial Court within 7 days of removing the child.' },
          { right: 'Kinship and cultural placement priority', section: 'Section 71', detail: 'Priority must be given to placing the child with a relative, with a person from the child\'s Indigenous community, or in an environment consistent with their cultural identity.' },
          { right: 'You can consent to a voluntary care agreement', section: 'Section 6', detail: 'Instead of apprehension, you may agree to a Voluntary Care Agreement where you temporarily place your child in care while you address the concerns.' },
          { right: 'The director must return the child if grounds no longer exist', section: 'Section 30', detail: 'If the director determines the child is no longer in need of protection, the child must be returned to you.' },
        ]
      },
      {
        id: 'court', title: 'Your Rights in Court', icon: '⚖️',
        rights: [
          { right: 'You have the right to contest the removal', section: 'Section 34', detail: 'You can appear at the protection hearing, present evidence, and argue for the child\'s return.' },
          { right: 'You can appeal any order', section: 'Section 82', detail: 'You have the right to appeal any order made under the Act to the Supreme Court.' },
          { right: 'Time limits on continuing custody orders', section: 'Section 43', detail: 'There are maximum time limits for temporary custody orders, after which the child must be returned or a permanent order sought.' },
          { right: 'You can apply to vary or cancel any order', section: 'Section 54', detail: 'You can apply to the court to change or cancel a supervision or custody order if circumstances change.' },
        ]
      },
      {
        id: 'access', title: 'Your Rights to Access & Visits', icon: '👨‍👩‍👧',
        rights: [
          { right: 'Access can be included in custody orders', section: 'Section 48', detail: 'The court can order access (visits) between you and your child while the child is in the director\'s custody.' },
          { right: 'You can apply for access at any time', section: 'Section 48', detail: 'You can apply to the court for an access order even if one wasn\'t initially included.' },
          { right: 'The director must facilitate reasonable visits', section: 'General', detail: 'Unless the court orders otherwise, the director should make reasonable arrangements for you to visit your child.' },
        ]
      },
      {
        id: 'indigenous', title: 'Indigenous Family Rights', icon: '🪶',
        rights: [
          { right: 'Indigenous communities must be notified', section: 'Section 33.1', detail: 'If the child is Indigenous, the relevant Indigenous community or organization must be notified when the child is removed.' },
          { right: 'Cultural placement is prioritized', section: 'Section 71', detail: 'The Act prioritizes placing Indigenous children with their extended family, within their Indigenous community, or in a culturally appropriate environment.' },
          { right: 'Indigenous governing bodies may exercise jurisdiction', section: 'Bill 38 Amendments', detail: 'Recent amendments support Indigenous self-government in child and family services and remove barriers to Indigenous jurisdiction.' },
          { right: 'Customary care arrangements', section: 'Section 71.1', detail: 'The director can make arrangements for customary care consistent with the traditions of the child\'s Indigenous community.' },
        ]
      },
      {
        id: 'complaints', title: 'How to File a Complaint', icon: '📋',
        rights: [
          { right: 'Contact the Representative for Children and Youth', section: 'Representative for Children and Youth Act', detail: 'The RCY is an independent officer of the Legislature who advocates for children and youth. They can investigate complaints about MCFD services. Call 1-800-476-3933.' },
          { right: 'Request a review of a director\'s decision', section: 'General', detail: 'You can request a formal review of any decision made by the director regarding your child.' },
          { right: 'Contact the BC Ombudsperson', section: 'Ombudsperson Act', detail: 'The BC Ombudsperson can investigate complaints about provincial government services. Call 1-800-567-3247.' },
          { right: 'Request your MCFD file', section: 'Freedom of Information and Protection of Privacy Act', detail: 'You can request access to your MCFD records through an FOI request.' },
        ]
      },
      {
        id: 'custody', title: 'Your Custody Rights', icon: '👨‍👩‍👧‍👦',
        rights: [
          { right: 'Both parents have equal rights unless ordered otherwise', section: 'Provincial Family Law', detail: 'Unless a court order exists, both parents generally have equal rights to custody and decision-making for their children.' },
          { right: 'Best interests of the child is the primary consideration', section: 'Provincial Family Law', detail: 'All custody decisions must be based on the best interests of the child, considering safety, stability, relationships, and the child\'s views.' },
          { right: 'You can represent yourself in court', section: 'Court Rules', detail: 'You have the right to represent yourself in family court proceedings. Many courts have self-help centres to assist unrepresented litigants.' },
          { right: 'Children\'s views are considered', section: 'Provincial Family Law', detail: 'Courts consider the child\'s views and preferences depending on age and maturity when making custody decisions.' },
          { right: 'Mediation may be available or required', section: 'Provincial Family Law', detail: 'Many jurisdictions offer or require mediation before proceeding to a contested custody hearing.' },
        ]
      },
      {
        id: 'support', title: 'Your Child Support Rights', icon: '💰',
        rights: [
          { right: 'Both parents must support their children', section: 'Provincial Family Law', detail: 'Both parents have a legal obligation to financially support their children regardless of custody arrangements.' },
          { right: 'Federal Child Support Guidelines apply', section: 'Federal Guidelines', detail: 'Child support amounts are determined by the Federal Child Support Guidelines tables based on income and number of children.' },
          { right: 'You can request financial disclosure', section: 'Provincial Family Law', detail: 'You have the right to request complete financial disclosure from the other parent to ensure accurate support calculations.' },
          { right: 'Support orders can be enforced', section: 'Provincial Enforcement Program', detail: 'Each province has a maintenance enforcement program that can garnish wages, seize assets, and suspend licenses to enforce support orders.' },
          { right: 'Support can be varied on material change', section: 'Provincial Family Law', detail: 'Either parent can apply to change the support amount if there has been a significant change in circumstances.' },
        ]
      },
      {
        id: 'relocation', title: 'Relocation & Travel Rights', icon: '✈️',
        rights: [
          { right: 'Notice is required before relocating with a child', section: 'Provincial Family Law', detail: 'A parent planning to move with a child must give written notice to the other parent. The required notice period varies by province.' },
          { right: 'Both parents must consent to international travel', section: 'General', detail: 'Taking a child outside Canada typically requires consent of both parents or a court order. Carry a notarized consent letter.' },
          { right: 'Courts can restrict travel', section: 'Provincial Family Law', detail: 'Courts can order that a child\'s passport be held by the court or restrict a parent from removing a child from the province or country.' },
          { right: 'Relocation disputes focus on best interests', section: 'Provincial Family Law', detail: 'When parents disagree about relocation, the court considers the child\'s best interests, the reason for the move, and the impact on relationships.' },
        ]
      },
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
          { right: 'You have the right to consult a lawyer', section: 'General', detail: 'Contact Legal Aid Manitoba at 1-800-261-2960 for free legal assistance.' },
          { right: 'Family support services must be offered', section: 'Section 7', detail: 'Agencies must provide or arrange for family support services to prevent children from coming into care whenever possible.' },
          { right: 'You can have a support person present during meetings', section: 'General', detail: 'You are entitled to have a family member, friend, or advocate present when meeting with agency workers.' },
          { right: 'You can refuse entry to your home without a warrant', section: 'Section 17', detail: 'A worker generally needs a court order to enter your home unless there is an immediate risk to the child.' },
        ]
      },
      {
        id: 'apprehension', title: 'Your Rights During an Apprehension', icon: '⚠️',
        rights: [
          { right: 'You must be notified of the apprehension', section: 'Section 24', detail: 'The agency must make reasonable efforts to notify parents or guardians of the apprehension of a child.' },
          { right: 'Access to your child pending a hearing', section: 'Section 27', detail: 'The Act provides for access by parents to an apprehended child pending a child protection hearing.' },
          { right: 'A court hearing must be held within prescribed timelines', section: 'Section 27', detail: 'The agency must apply to the court for a hearing after apprehension within the timelines set by the Act.' },
          { right: 'The child can be left with or returned to a caregiver', section: 'Section 26', detail: 'The agency can leave the child with or return the child to the person who had charge of the child at the time of apprehension.' },
          { right: 'No-contact orders as an alternative', section: 'Section 20', detail: 'Instead of removing the child, the court can order the alleged abuser to have no contact with the child — allowing the child to stay home.' },
        ]
      },
      {
        id: 'court', title: 'Your Rights in Court', icon: '⚖️',
        rights: [
          { right: 'Children over 12 have the right to be heard', section: 'Section 2(2)', detail: 'Children over 12 years of age have the right to have their views and preferences known to the court.' },
          { right: 'Right to legal counsel', section: 'Section 34', detail: 'The Act provides for the right to counsel in child protection proceedings.' },
          { right: 'You can challenge any order', section: 'General', detail: 'You can contest applications, present evidence, and cross-examine witnesses.' },
          { right: 'Orders can be varied or terminated', section: 'Section 40', detail: 'You can apply for further hearings and orders to change the terms of any existing order.' },
        ]
      },
      {
        id: 'access', title: 'Your Rights to Access & Visits', icon: '👨‍👩‍👧',
        rights: [
          { right: 'Access provisions for temporary and permanent wards', section: 'Section 39', detail: 'The Act contains specific provisions regarding access by parents or guardians to children who are temporary or permanent wards.' },
          { right: 'Access pending a hearing', section: 'Section 27', detail: 'You have the right to access your child while waiting for a protection hearing, unless the court orders otherwise.' },
        ]
      },
      {
        id: 'indigenous', title: 'Indigenous Family Rights', icon: '🪶',
        rights: [
          { right: 'Four authorities oversee services including three Aboriginal authorities', section: 'Child and Family Services Authorities Act', detail: 'Manitoba has four CFS authorities: the General Authority, plus three Aboriginal authorities (Métis, First Nations of Southern Manitoba, and First Nations of Northern Manitoba).' },
          { right: '18 agencies report to Aboriginal authorities', section: 'General', detail: 'There are 18 agencies reporting to the three Aboriginal authorities, providing culturally appropriate services.' },
          { right: 'Cultural continuity must be considered', section: 'Section 7', detail: 'Services must be provided in a manner that respects the cultural and linguistic heritage of the family.' },
        ]
      },
      {
        id: 'complaints', title: 'How to File a Complaint', icon: '📋',
        rights: [
          { right: 'Contact the Manitoba Advocate for Children and Youth', section: 'The Advocate for Children and Youth Act', detail: 'Independent office that reviews child welfare services and investigates complaints. Call 1-800-263-7146.' },
          { right: 'File a complaint with the agency', section: 'General', detail: 'Each CFS agency must have a complaint process. Request their formal complaints procedure.' },
          { right: 'Contact the Manitoba Ombudsman', section: 'Ombudsman Act', detail: 'The Ombudsman can investigate complaints about government services. Call 1-800-665-0531.' },
        ]
      },
      {
        id: 'custody', title: 'Your Custody Rights', icon: '👨‍👩‍👧‍👦',
        rights: [
          { right: 'Both parents have equal rights unless ordered otherwise', section: 'Provincial Family Law', detail: 'Unless a court order exists, both parents generally have equal rights to custody and decision-making for their children.' },
          { right: 'Best interests of the child is the primary consideration', section: 'Provincial Family Law', detail: 'All custody decisions must be based on the best interests of the child, considering safety, stability, relationships, and the child\'s views.' },
          { right: 'You can represent yourself in court', section: 'Court Rules', detail: 'You have the right to represent yourself in family court proceedings. Many courts have self-help centres to assist unrepresented litigants.' },
          { right: 'Children\'s views are considered', section: 'Provincial Family Law', detail: 'Courts consider the child\'s views and preferences depending on age and maturity when making custody decisions.' },
          { right: 'Mediation may be available or required', section: 'Provincial Family Law', detail: 'Many jurisdictions offer or require mediation before proceeding to a contested custody hearing.' },
        ]
      },
      {
        id: 'support', title: 'Your Child Support Rights', icon: '💰',
        rights: [
          { right: 'Both parents must support their children', section: 'Provincial Family Law', detail: 'Both parents have a legal obligation to financially support their children regardless of custody arrangements.' },
          { right: 'Federal Child Support Guidelines apply', section: 'Federal Guidelines', detail: 'Child support amounts are determined by the Federal Child Support Guidelines tables based on income and number of children.' },
          { right: 'You can request financial disclosure', section: 'Provincial Family Law', detail: 'You have the right to request complete financial disclosure from the other parent to ensure accurate support calculations.' },
          { right: 'Support orders can be enforced', section: 'Provincial Enforcement Program', detail: 'Each province has a maintenance enforcement program that can garnish wages, seize assets, and suspend licenses to enforce support orders.' },
          { right: 'Support can be varied on material change', section: 'Provincial Family Law', detail: 'Either parent can apply to change the support amount if there has been a significant change in circumstances.' },
        ]
      },
      {
        id: 'relocation', title: 'Relocation & Travel Rights', icon: '✈️',
        rights: [
          { right: 'Notice is required before relocating with a child', section: 'Provincial Family Law', detail: 'A parent planning to move with a child must give written notice to the other parent. The required notice period varies by province.' },
          { right: 'Both parents must consent to international travel', section: 'General', detail: 'Taking a child outside Canada typically requires consent of both parents or a court order. Carry a notarized consent letter.' },
          { right: 'Courts can restrict travel', section: 'Provincial Family Law', detail: 'Courts can order that a child\'s passport be held by the court or restrict a parent from removing a child from the province or country.' },
          { right: 'Relocation disputes focus on best interests', section: 'Provincial Family Law', detail: 'When parents disagree about relocation, the court considers the child\'s best interests, the reason for the move, and the impact on relationships.' },
        ]
      },
    ]
  },
  quebec: {
    jurisdiction: 'Quebec',
    flag: '🇨🇦',
    status: 'live',
    actName: 'Youth Protection Act (Loi sur la protection de la jeunesse, P-34.1)',
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
          { right: 'DPJ must assess the report within specific timelines', section: 'Section 32', detail: 'The DPJ must assess whether the child\'s security or development is compromised within prescribed timelines after receiving a report.' },
          { right: 'You have the right to a lawyer at every stage', section: 'Section 5', detail: 'Every person has the right to be assisted and represented by a lawyer at every stage of proceedings under this Act. Contact Legal Aid Quebec.' },
          { right: 'Voluntary measures must be considered first', section: 'Section 51', detail: 'The DPJ must propose voluntary measures and agreements with the family before resorting to court intervention.' },
          { right: 'You have the right to be informed of your rights', section: 'Section 8', detail: 'The DPJ must inform you of your rights, including the right to consult a lawyer and to contest decisions.' },
          { right: 'Your consent is needed for voluntary measures', section: 'Section 52', detail: 'Voluntary measures require the consent of both the parent and the child (if 14 or older). You cannot be forced to accept voluntary measures.' },
          { right: 'Reports must meet the definition of compromised security', section: 'Section 38', detail: 'The Act defines specific situations where security or development is compromised, including abandonment, neglect, psychological ill-treatment, sexual abuse, and physical abuse.' },
        ]
      },
      {
        id: 'apprehension', title: 'Your Rights During an Apprehension (Emergency Removal)', icon: '⚠️',
        rights: [
          { right: 'Emergency removal requires imminent danger', section: 'Section 46', detail: 'A child can only be removed immediately (without a court order) if their security or development is considered to be in immediate danger.' },
          { right: 'You must be informed of the reasons and your rights', section: 'Section 48', detail: 'You must be notified promptly of the specific reasons for the removal and informed of your rights, including the right to a lawyer.' },
          { right: 'Court hearing within specific timelines', section: 'Section 47', detail: 'If the child is removed on an emergency basis, the matter must be brought before the tribunal within the timelines prescribed by the Act.' },
          { right: 'Placement with extended family is preferred', section: 'Section 4', detail: 'The Act prioritizes maintaining the child within their family environment. Placement with extended family or in a familiar environment is preferred.' },
          { right: 'The DPJ must attempt to return the child quickly', section: 'Section 46', detail: 'Emergency measures are temporary. The DPJ must work toward returning the child or seeking a court order as soon as possible.' },
        ]
      },
      {
        id: 'court', title: 'Your Rights in Court (Tribunal)', icon: '⚖️',
        rights: [
          { right: 'Right to be heard by the tribunal', section: 'Section 74', detail: 'All parties — including parents and children 14 and older — have the right to be heard and to present evidence at the tribunal hearing.' },
          { right: 'Children 14+ can consent or refuse measures independently', section: 'Section 52', detail: 'Children 14 years and older have the right to consent to or refuse voluntary measures and must be a party to court proceedings.' },
          { right: 'Right to appeal any tribunal decision', section: 'Section 100', detail: 'You can appeal any decision of the tribunal to the Superior Court.' },
          { right: 'Right to legal representation', section: 'Section 5', detail: 'You have the right to be represented by a lawyer throughout all proceedings. Legal Aid Quebec can provide a lawyer if you qualify financially.' },
          { right: 'Time limits on court orders', section: 'Section 91.1', detail: 'The Act imposes maximum duration limits on court orders to ensure children do not remain in care indefinitely without review.' },
        ]
      },
      {
        id: 'access', title: 'Your Rights to Access & Visits', icon: '👨‍👩‍👧',
        rights: [
          { right: 'Access can be included in any order', section: 'General', detail: 'The tribunal can include access (visitation) provisions in any protection order, allowing you to maintain contact with your child.' },
          { right: 'Voluntary measures can include access terms', section: 'Section 54', detail: 'If you agree to voluntary measures, the agreement can include specific terms about your access to the child.' },
          { right: 'You can apply to modify access', section: 'General', detail: 'You can apply to the tribunal to change the terms of your access if your circumstances change.' },
        ]
      },
      {
        id: 'indigenous', title: 'Indigenous Family Rights', icon: '🪶',
        rights: [
          { right: 'Cultural identity must be preserved', section: 'Section 3', detail: 'The Act recognizes the importance of preserving the cultural identity of Indigenous children in all decisions.' },
          { right: 'Indigenous community involvement', section: 'General', detail: 'Indigenous communities should be involved in decisions regarding their children, consistent with federal legislation (Bill C-92).' },
          { right: 'Federal Act may apply', section: 'An Act Respecting First Nations, Inuit and Métis Children', detail: 'If the child belongs to an Indigenous community that has established its own child welfare law, that law may take precedence.' },
        ]
      },
      {
        id: 'complaints', title: 'How to File a Complaint', icon: '📋',
        rights: [
          { right: 'Contact the Commission des droits de la personne', section: 'General', detail: 'The Commission can investigate complaints about children\'s rights violations. Call 1-800-265-0779.' },
          { right: 'Request a revision of a DPJ decision', section: 'Section 9', detail: 'You can request a formal revision of any decision made by the DPJ within the prescribed timelines.' },
          { right: 'File a complaint with the institution\'s complaints commissioner', section: 'General', detail: 'Each health and social services institution has a complaints commissioner who can handle complaints about DPJ services.' },
          { right: 'Contact the Quebec Ombudsman (Protecteur du citoyen)', section: 'General', detail: 'The Protecteur du citoyen can investigate complaints about public services. Call 1-800-463-5070.' },
        ]
      },
      {
        id: 'custody', title: 'Your Custody Rights', icon: '👨‍👩‍👧‍👦',
        rights: [
          { right: 'Both parents have equal rights unless ordered otherwise', section: 'Provincial Family Law', detail: 'Unless a court order exists, both parents generally have equal rights to custody and decision-making for their children.' },
          { right: 'Best interests of the child is the primary consideration', section: 'Provincial Family Law', detail: 'All custody decisions must be based on the best interests of the child, considering safety, stability, relationships, and the child\'s views.' },
          { right: 'You can represent yourself in court', section: 'Court Rules', detail: 'You have the right to represent yourself in family court proceedings. Many courts have self-help centres to assist unrepresented litigants.' },
          { right: 'Children\'s views are considered', section: 'Provincial Family Law', detail: 'Courts consider the child\'s views and preferences depending on age and maturity when making custody decisions.' },
          { right: 'Mediation may be available or required', section: 'Provincial Family Law', detail: 'Many jurisdictions offer or require mediation before proceeding to a contested custody hearing.' },
        ]
      },
      {
        id: 'support', title: 'Your Child Support Rights', icon: '💰',
        rights: [
          { right: 'Both parents must support their children', section: 'Provincial Family Law', detail: 'Both parents have a legal obligation to financially support their children regardless of custody arrangements.' },
          { right: 'Federal Child Support Guidelines apply', section: 'Federal Guidelines', detail: 'Child support amounts are determined by the Federal Child Support Guidelines tables based on income and number of children.' },
          { right: 'You can request financial disclosure', section: 'Provincial Family Law', detail: 'You have the right to request complete financial disclosure from the other parent to ensure accurate support calculations.' },
          { right: 'Support orders can be enforced', section: 'Provincial Enforcement Program', detail: 'Each province has a maintenance enforcement program that can garnish wages, seize assets, and suspend licenses to enforce support orders.' },
          { right: 'Support can be varied on material change', section: 'Provincial Family Law', detail: 'Either parent can apply to change the support amount if there has been a significant change in circumstances.' },
        ]
      },
      {
        id: 'relocation', title: 'Relocation & Travel Rights', icon: '✈️',
        rights: [
          { right: 'Notice is required before relocating with a child', section: 'Provincial Family Law', detail: 'A parent planning to move with a child must give written notice to the other parent. The required notice period varies by province.' },
          { right: 'Both parents must consent to international travel', section: 'General', detail: 'Taking a child outside Canada typically requires consent of both parents or a court order. Carry a notarized consent letter.' },
          { right: 'Courts can restrict travel', section: 'Provincial Family Law', detail: 'Courts can order that a child\'s passport be held by the court or restrict a parent from removing a child from the province or country.' },
          { right: 'Relocation disputes focus on best interests', section: 'Provincial Family Law', detail: 'When parents disagree about relocation, the court considers the child\'s best interests, the reason for the move, and the impact on relationships.' },
        ]
      },
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
          { right: 'Services must be offered to keep the family together', section: 'Section 13', detail: 'The agency should provide protective services that support the family and prevent removal whenever possible.' },
          { right: 'You can refuse entry without a warrant', section: 'Section 27', detail: 'A worker generally requires a court order to enter your home unless the child is believed to be in immediate danger.' },
          { right: 'Duty to report is broad in NS', section: 'Section 23', detail: 'In Nova Scotia, the duty to report applies even where information comes through a confidential relationship (including solicitor-client). This is broader than most provinces.' },
        ]
      },
      {
        id: 'apprehension', title: 'Your Rights During an Apprehension', icon: '⚠️',
        rights: [
          { right: 'You must be notified of the apprehension', section: 'Section 33', detail: 'The agency must notify you of the apprehension and the specific reasons for it.' },
          { right: 'A court hearing must occur promptly', section: 'Section 39', detail: 'The matter must be brought before the court within prescribed timelines after apprehension.' },
          { right: 'Placement with family is preferred', section: 'Section 42', detail: 'Priority is given to placing the child with a relative or within their community.' },
          { right: 'You can consent to a voluntary agreement instead', section: 'Section 14', detail: 'Instead of court proceedings, you may agree to a voluntary care and custody agreement.' },
        ]
      },
      {
        id: 'court', title: 'Your Rights in Court', icon: '⚖️',
        rights: [
          { right: 'You can contest any protection application', section: 'General', detail: 'You have the right to appear, present evidence, call witnesses, and cross-examine agency witnesses.' },
          { right: 'You can appeal court orders', section: 'General', detail: 'You have the right to appeal any order made under the Act.' },
          { right: 'Time limits on care orders', section: 'General', detail: 'Temporary care and custody orders have maximum time limits.' },
        ]
      },
      {
        id: 'access', title: 'Your Rights to Access & Visits', icon: '👨‍👩‍👧',
        rights: [
          { right: 'Access provisions can be included in orders', section: 'Section 43', detail: 'The court can include access provisions allowing you to visit your child while they are in care.' },
          { right: 'You can apply to vary access', section: 'General', detail: 'You can apply to the court to change access terms if circumstances have changed.' },
        ]
      },
      {
        id: 'indigenous', title: 'Indigenous Family Rights', icon: '🪶',
        rights: [
          { right: 'Mi\'kmaq Family and Children\'s Services', section: 'General', detail: 'Mi\'kmaq Family and Children\'s Services of Nova Scotia provides culturally appropriate child welfare services to Mi\'kmaq communities.' },
          { right: 'Cultural considerations in placement', section: 'Section 42', detail: 'The child\'s cultural and religious heritage must be considered when making placement decisions.' },
        ]
      },
      {
        id: 'complaints', title: 'How to File a Complaint', icon: '📋',
        rights: [
          { right: 'Contact the Nova Scotia Ombudsman', section: 'Ombudsman Act', detail: 'The Ombudsman can investigate complaints about government services. Call 902-424-6070.' },
          { right: 'File a complaint with the Department', section: 'General', detail: 'Contact the Department of Community Services directly to file a formal complaint.' },
          { right: 'Contact your MLA', section: 'General', detail: 'Your Member of the Legislative Assembly can raise concerns on your behalf.' },
        ]
      },
      {
        id: 'custody', title: 'Your Custody Rights', icon: '👨‍👩‍👧‍👦',
        rights: [
          { right: 'Both parents have equal rights unless ordered otherwise', section: 'Provincial Family Law', detail: 'Unless a court order exists, both parents generally have equal rights to custody and decision-making for their children.' },
          { right: 'Best interests of the child is the primary consideration', section: 'Provincial Family Law', detail: 'All custody decisions must be based on the best interests of the child, considering safety, stability, relationships, and the child\'s views.' },
          { right: 'You can represent yourself in court', section: 'Court Rules', detail: 'You have the right to represent yourself in family court proceedings. Many courts have self-help centres to assist unrepresented litigants.' },
          { right: 'Children\'s views are considered', section: 'Provincial Family Law', detail: 'Courts consider the child\'s views and preferences depending on age and maturity when making custody decisions.' },
          { right: 'Mediation may be available or required', section: 'Provincial Family Law', detail: 'Many jurisdictions offer or require mediation before proceeding to a contested custody hearing.' },
        ]
      },
      {
        id: 'support', title: 'Your Child Support Rights', icon: '💰',
        rights: [
          { right: 'Both parents must support their children', section: 'Provincial Family Law', detail: 'Both parents have a legal obligation to financially support their children regardless of custody arrangements.' },
          { right: 'Federal Child Support Guidelines apply', section: 'Federal Guidelines', detail: 'Child support amounts are determined by the Federal Child Support Guidelines tables based on income and number of children.' },
          { right: 'You can request financial disclosure', section: 'Provincial Family Law', detail: 'You have the right to request complete financial disclosure from the other parent to ensure accurate support calculations.' },
          { right: 'Support orders can be enforced', section: 'Provincial Enforcement Program', detail: 'Each province has a maintenance enforcement program that can garnish wages, seize assets, and suspend licenses to enforce support orders.' },
          { right: 'Support can be varied on material change', section: 'Provincial Family Law', detail: 'Either parent can apply to change the support amount if there has been a significant change in circumstances.' },
        ]
      },
      {
        id: 'relocation', title: 'Relocation & Travel Rights', icon: '✈️',
        rights: [
          { right: 'Notice is required before relocating with a child', section: 'Provincial Family Law', detail: 'A parent planning to move with a child must give written notice to the other parent. The required notice period varies by province.' },
          { right: 'Both parents must consent to international travel', section: 'General', detail: 'Taking a child outside Canada typically requires consent of both parents or a court order. Carry a notarized consent letter.' },
          { right: 'Courts can restrict travel', section: 'Provincial Family Law', detail: 'Courts can order that a child\'s passport be held by the court or restrict a parent from removing a child from the province or country.' },
          { right: 'Relocation disputes focus on best interests', section: 'Provincial Family Law', detail: 'When parents disagree about relocation, the court considers the child\'s best interests, the reason for the move, and the impact on relationships.' },
        ]
      },
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
          { right: 'The Minister must investigate reports', section: 'Section 31', detail: 'The Minister must investigate where there is information that a child\'s security or development may be in danger.' },
          { right: 'You have the right to a lawyer', section: 'General', detail: 'Contact Legal Aid New Brunswick at 1-800-442-4862.' },
          { right: 'Support services must be considered first', section: 'Section 34', detail: 'Voluntary agreements and support services must be considered before court intervention or removal.' },
          { right: 'You can refuse entry without a warrant', section: 'General', detail: 'A worker generally needs a court order to enter your home unless there is immediate danger to the child.' },
          { right: 'Solicitor-client privilege is protected', section: 'Section 30', detail: 'In New Brunswick, the duty to report does not extend to information protected by solicitor-client privilege.' },
        ]
      },
      {
        id: 'apprehension', title: 'Your Rights During an Apprehension', icon: '⚠️',
        rights: [
          { right: 'You must be informed of the reasons', section: 'Section 36', detail: 'You must be notified of the grounds for removal and your right to consult a lawyer.' },
          { right: 'A court hearing must be held promptly', section: 'Section 37', detail: 'The matter must be brought before the court within the prescribed timelines.' },
          { right: 'Placement with family is preferred', section: 'General', detail: 'Priority should be given to placing the child with extended family or within their community.' },
          { right: 'You can enter a voluntary agreement', section: 'Section 34', detail: 'Instead of apprehension, the Minister can enter into a voluntary agreement with you for support services.' },
        ]
      },
      {
        id: 'court', title: 'Your Rights in Court', icon: '⚖️',
        rights: [
          { right: 'You can contest any application', section: 'General', detail: 'You have the right to appear in court, present evidence, and challenge the Minister\'s application.' },
          { right: 'You can appeal court decisions', section: 'General', detail: 'You have the right to appeal any order made under the Act.' },
          { right: 'Orders have time limits', section: 'General', detail: 'Supervision and custody orders have maximum durations and must be reviewed.' },
        ]
      },
      {
        id: 'access', title: 'Your Rights to Access & Visits', icon: '👨‍👩‍👧',
        rights: [
          { right: 'Access can be ordered by the court', section: 'General', detail: 'The court can include access provisions in any order, allowing you to maintain contact with your child.' },
          { right: 'You can apply to vary access terms', section: 'General', detail: 'If your circumstances change, you can apply to modify the access arrangements.' },
        ]
      },
      {
        id: 'indigenous', title: 'Indigenous Family Rights', icon: '🪶',
        rights: [
          { right: 'Eight First Nations child and family service agencies', section: 'General', detail: 'New Brunswick has eight First Nations Child and Family Service agencies serving 15 First Nations communities.' },
          { right: 'Cultural placement considerations', section: 'General', detail: 'The child\'s cultural background must be considered in placement decisions.' },
          { right: 'Federal Act may apply', section: 'Bill C-92', detail: 'Indigenous communities that have established their own child welfare laws may have jurisdiction.' },
        ]
      },
      {
        id: 'complaints', title: 'How to File a Complaint', icon: '📋',
        rights: [
          { right: 'Contact the Child and Youth Advocate', section: 'Child and Youth Advocate Act', detail: 'Independent advocate who can investigate complaints about child welfare services. Call 1-888-465-1100.' },
          { right: 'File a complaint with the Department', section: 'General', detail: 'Contact the Department of Social Development to file a formal complaint.' },
          { right: 'Contact the NB Ombudsman', section: 'Ombudsman Act', detail: 'The Ombudsman can investigate complaints about government services. Call 1-888-465-1100.' },
        ]
      },
      {
        id: 'custody', title: 'Your Custody Rights', icon: '👨‍👩‍👧‍👦',
        rights: [
          { right: 'Both parents have equal rights unless ordered otherwise', section: 'Provincial Family Law', detail: 'Unless a court order exists, both parents generally have equal rights to custody and decision-making for their children.' },
          { right: 'Best interests of the child is the primary consideration', section: 'Provincial Family Law', detail: 'All custody decisions must be based on the best interests of the child, considering safety, stability, relationships, and the child\'s views.' },
          { right: 'You can represent yourself in court', section: 'Court Rules', detail: 'You have the right to represent yourself in family court proceedings. Many courts have self-help centres to assist unrepresented litigants.' },
          { right: 'Children\'s views are considered', section: 'Provincial Family Law', detail: 'Courts consider the child\'s views and preferences depending on age and maturity when making custody decisions.' },
          { right: 'Mediation may be available or required', section: 'Provincial Family Law', detail: 'Many jurisdictions offer or require mediation before proceeding to a contested custody hearing.' },
        ]
      },
      {
        id: 'support', title: 'Your Child Support Rights', icon: '💰',
        rights: [
          { right: 'Both parents must support their children', section: 'Provincial Family Law', detail: 'Both parents have a legal obligation to financially support their children regardless of custody arrangements.' },
          { right: 'Federal Child Support Guidelines apply', section: 'Federal Guidelines', detail: 'Child support amounts are determined by the Federal Child Support Guidelines tables based on income and number of children.' },
          { right: 'You can request financial disclosure', section: 'Provincial Family Law', detail: 'You have the right to request complete financial disclosure from the other parent to ensure accurate support calculations.' },
          { right: 'Support orders can be enforced', section: 'Provincial Enforcement Program', detail: 'Each province has a maintenance enforcement program that can garnish wages, seize assets, and suspend licenses to enforce support orders.' },
          { right: 'Support can be varied on material change', section: 'Provincial Family Law', detail: 'Either parent can apply to change the support amount if there has been a significant change in circumstances.' },
        ]
      },
      {
        id: 'relocation', title: 'Relocation & Travel Rights', icon: '✈️',
        rights: [
          { right: 'Notice is required before relocating with a child', section: 'Provincial Family Law', detail: 'A parent planning to move with a child must give written notice to the other parent. The required notice period varies by province.' },
          { right: 'Both parents must consent to international travel', section: 'General', detail: 'Taking a child outside Canada typically requires consent of both parents or a court order. Carry a notarized consent letter.' },
          { right: 'Courts can restrict travel', section: 'Provincial Family Law', detail: 'Courts can order that a child\'s passport be held by the court or restrict a parent from removing a child from the province or country.' },
          { right: 'Relocation disputes focus on best interests', section: 'Provincial Family Law', detail: 'When parents disagree about relocation, the court considers the child\'s best interests, the reason for the move, and the impact on relationships.' },
        ]
      },
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
          { right: 'A manager must assess reports', section: 'Section 14', detail: 'A manager must assess whether a child is in need of protective intervention upon receiving a report.' },
          { right: 'You have the right to counsel', section: 'General', detail: 'Contact Legal Aid NL at 1-800-563-9911.' },
          { right: 'Voluntary services agreements are available', section: 'Section 15', detail: 'A manager may enter into agreements with families to provide support services voluntarily, without court proceedings.' },
          { right: 'You can refuse entry without a warrant', section: 'General', detail: 'A worker needs a court order to enter your home unless the child is in immediate danger.' },
          { right: 'Protection eligibility up to age 16', section: 'Section 10', detail: 'In Newfoundland, child protection services apply to children under 16 — one of the lower age thresholds in Canada.' },
        ]
      },
      {
        id: 'apprehension', title: 'Your Rights During an Apprehension', icon: '⚠️',
        rights: [
          { right: 'You must be notified promptly', section: 'Section 20', detail: 'You must be informed of the apprehension, the specific reasons, and your right to a lawyer.' },
          { right: 'A hearing must occur within prescribed timelines', section: 'Section 22', detail: 'The matter must be brought before the court promptly after apprehension.' },
          { right: 'Placement with family is preferred', section: 'Section 16', detail: 'The Act prioritizes keeping the child within their family and community.' },
          { right: 'You can negotiate a voluntary care agreement', section: 'Section 15', detail: 'Instead of court proceedings, you may agree to a voluntary care arrangement.' },
        ]
      },
      {
        id: 'court', title: 'Your Rights in Court', icon: '⚖️',
        rights: [
          { right: 'You can challenge any protection order', section: 'General', detail: 'You have the right to present evidence and contest the manager\'s application.' },
          { right: 'You can appeal court decisions', section: 'General', detail: 'You can appeal any order to a higher court.' },
          { right: 'Orders have maximum time limits', section: 'General', detail: 'Protection orders have prescribed maximum durations and must be reviewed.' },
        ]
      },
      {
        id: 'access', title: 'Your Rights to Access & Visits', icon: '👨‍👩‍👧',
        rights: [
          { right: 'Access can be included in protection orders', section: 'General', detail: 'The court can include access provisions allowing you to visit your child.' },
          { right: 'You can apply to modify access', section: 'General', detail: 'Apply to the court to change access arrangements if your circumstances improve.' },
        ]
      },
      {
        id: 'indigenous', title: 'Indigenous Family Rights', icon: '🪶',
        rights: [
          { right: 'Nunatsiavut Inuit communities are self-governing', section: 'General', detail: 'The Inuit communities of Northern Labrador (Nunatsiavut) are self-governing but have not yet implemented separate child protection legislation.' },
          { right: 'Cultural considerations in placement', section: 'General', detail: 'The child\'s Indigenous cultural heritage must be considered in all placement decisions.' },
        ]
      },
      {
        id: 'complaints', title: 'How to File a Complaint', icon: '📋',
        rights: [
          { right: 'Contact the Child and Youth Advocate', section: 'Advocate for Children and Youth Act', detail: 'Independent advocate who investigates complaints about child welfare services. Call 1-877-753-3840.' },
          { right: 'File a complaint with the Department', section: 'General', detail: 'Contact the Department of Children, Seniors and Social Development directly.' },
          { right: 'Contact the NL Citizens\' Representative', section: 'Citizens\' Representative Act', detail: 'The Citizens\' Representative (Ombudsman) can investigate complaints about government services. Call 1-800-559-0079.' },
        ]
      },
      {
        id: 'custody', title: 'Your Custody Rights', icon: '👨‍👩‍👧‍👦',
        rights: [
          { right: 'Both parents have equal rights unless ordered otherwise', section: 'Provincial Family Law', detail: 'Unless a court order exists, both parents generally have equal rights to custody and decision-making for their children.' },
          { right: 'Best interests of the child is the primary consideration', section: 'Provincial Family Law', detail: 'All custody decisions must be based on the best interests of the child, considering safety, stability, relationships, and the child\'s views.' },
          { right: 'You can represent yourself in court', section: 'Court Rules', detail: 'You have the right to represent yourself in family court proceedings. Many courts have self-help centres to assist unrepresented litigants.' },
          { right: 'Children\'s views are considered', section: 'Provincial Family Law', detail: 'Courts consider the child\'s views and preferences depending on age and maturity when making custody decisions.' },
          { right: 'Mediation may be available or required', section: 'Provincial Family Law', detail: 'Many jurisdictions offer or require mediation before proceeding to a contested custody hearing.' },
        ]
      },
      {
        id: 'support', title: 'Your Child Support Rights', icon: '💰',
        rights: [
          { right: 'Both parents must support their children', section: 'Provincial Family Law', detail: 'Both parents have a legal obligation to financially support their children regardless of custody arrangements.' },
          { right: 'Federal Child Support Guidelines apply', section: 'Federal Guidelines', detail: 'Child support amounts are determined by the Federal Child Support Guidelines tables based on income and number of children.' },
          { right: 'You can request financial disclosure', section: 'Provincial Family Law', detail: 'You have the right to request complete financial disclosure from the other parent to ensure accurate support calculations.' },
          { right: 'Support orders can be enforced', section: 'Provincial Enforcement Program', detail: 'Each province has a maintenance enforcement program that can garnish wages, seize assets, and suspend licenses to enforce support orders.' },
          { right: 'Support can be varied on material change', section: 'Provincial Family Law', detail: 'Either parent can apply to change the support amount if there has been a significant change in circumstances.' },
        ]
      },
      {
        id: 'relocation', title: 'Relocation & Travel Rights', icon: '✈️',
        rights: [
          { right: 'Notice is required before relocating with a child', section: 'Provincial Family Law', detail: 'A parent planning to move with a child must give written notice to the other parent. The required notice period varies by province.' },
          { right: 'Both parents must consent to international travel', section: 'General', detail: 'Taking a child outside Canada typically requires consent of both parents or a court order. Carry a notarized consent letter.' },
          { right: 'Courts can restrict travel', section: 'Provincial Family Law', detail: 'Courts can order that a child\'s passport be held by the court or restrict a parent from removing a child from the province or country.' },
          { right: 'Relocation disputes focus on best interests', section: 'Provincial Family Law', detail: 'When parents disagree about relocation, the court considers the child\'s best interests, the reason for the move, and the impact on relationships.' },
        ]
      },
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
          { right: 'Support services should be considered', section: 'General', detail: 'The Director should consider providing support services to keep the family together before seeking removal.' },
          { right: 'You can refuse entry without a warrant', section: 'General', detail: 'A worker generally needs a court order to enter your home.' },
        ]
      },
      {
        id: 'apprehension', title: 'Your Rights During an Apprehension', icon: '⚠️',
        rights: [
          { right: 'You must be notified of the reasons', section: 'Section 22', detail: 'You must be informed of the apprehension, the reasons, and your right to counsel.' },
          { right: 'A court hearing must occur promptly', section: 'Section 25', detail: 'The child must be brought before the court within the prescribed timelines.' },
          { right: 'Placement with family is preferred', section: 'General', detail: 'Priority should be given to placing the child with extended family.' },
          { right: 'Voluntary agreements are available', section: 'General', detail: 'The Director can enter into voluntary agreements for services instead of proceeding with court action.' },
        ]
      },
      {
        id: 'court', title: 'Your Rights in Court', icon: '⚖️',
        rights: [
          { right: 'You can contest any application', section: 'General', detail: 'You have the right to appear, present evidence, and challenge the Director\'s application.' },
          { right: 'You can appeal orders', section: 'General', detail: 'You have the right to appeal any order made under the Act.' },
          { right: 'Protection orders have time limits', section: 'General', detail: 'Orders must be reviewed and cannot be indefinite.' },
        ]
      },
      {
        id: 'access', title: 'Your Rights to Access & Visits', icon: '👨‍👩‍👧',
        rights: [
          { right: 'Access can be ordered by the court', section: 'General', detail: 'The court can include access provisions in protection orders.' },
          { right: 'You can apply to modify access', section: 'General', detail: 'If circumstances change, you can apply to vary the access arrangements.' },
        ]
      },
      {
        id: 'indigenous', title: 'Indigenous Family Rights', icon: '🪶',
        rights: [
          { right: 'Mi\'kmaq cultural considerations', section: 'General', detail: 'PEI has a significant Mi\'kmaq population. Cultural background must be considered in placement decisions.' },
          { right: 'Federal Act may apply', section: 'Bill C-92', detail: 'Indigenous communities that have established child welfare jurisdiction may have precedence.' },
        ]
      },
      {
        id: 'complaints', title: 'How to File a Complaint', icon: '📋',
        rights: [
          { right: 'Contact the PEI Ombudsperson', section: 'Ombudsperson Act', detail: 'Can investigate complaints about government services. Call 902-368-4500.' },
          { right: 'File a complaint with the Department', section: 'General', detail: 'Contact the Department of Social Development and Seniors directly.' },
          { right: 'Contact CLIA for legal information', section: 'General', detail: 'The Community Legal Information Association of PEI provides free legal information. Call 902-892-0853.' },
        ]
      },
      {
        id: 'custody', title: 'Your Custody Rights', icon: '👨‍👩‍👧‍👦',
        rights: [
          { right: 'Both parents have equal rights unless ordered otherwise', section: 'Provincial Family Law', detail: 'Unless a court order exists, both parents generally have equal rights to custody and decision-making for their children.' },
          { right: 'Best interests of the child is the primary consideration', section: 'Provincial Family Law', detail: 'All custody decisions must be based on the best interests of the child, considering safety, stability, relationships, and the child\'s views.' },
          { right: 'You can represent yourself in court', section: 'Court Rules', detail: 'You have the right to represent yourself in family court proceedings. Many courts have self-help centres to assist unrepresented litigants.' },
          { right: 'Children\'s views are considered', section: 'Provincial Family Law', detail: 'Courts consider the child\'s views and preferences depending on age and maturity when making custody decisions.' },
          { right: 'Mediation may be available or required', section: 'Provincial Family Law', detail: 'Many jurisdictions offer or require mediation before proceeding to a contested custody hearing.' },
        ]
      },
      {
        id: 'support', title: 'Your Child Support Rights', icon: '💰',
        rights: [
          { right: 'Both parents must support their children', section: 'Provincial Family Law', detail: 'Both parents have a legal obligation to financially support their children regardless of custody arrangements.' },
          { right: 'Federal Child Support Guidelines apply', section: 'Federal Guidelines', detail: 'Child support amounts are determined by the Federal Child Support Guidelines tables based on income and number of children.' },
          { right: 'You can request financial disclosure', section: 'Provincial Family Law', detail: 'You have the right to request complete financial disclosure from the other parent to ensure accurate support calculations.' },
          { right: 'Support orders can be enforced', section: 'Provincial Enforcement Program', detail: 'Each province has a maintenance enforcement program that can garnish wages, seize assets, and suspend licenses to enforce support orders.' },
          { right: 'Support can be varied on material change', section: 'Provincial Family Law', detail: 'Either parent can apply to change the support amount if there has been a significant change in circumstances.' },
        ]
      },
      {
        id: 'relocation', title: 'Relocation & Travel Rights', icon: '✈️',
        rights: [
          { right: 'Notice is required before relocating with a child', section: 'Provincial Family Law', detail: 'A parent planning to move with a child must give written notice to the other parent. The required notice period varies by province.' },
          { right: 'Both parents must consent to international travel', section: 'General', detail: 'Taking a child outside Canada typically requires consent of both parents or a court order. Carry a notarized consent letter.' },
          { right: 'Courts can restrict travel', section: 'Provincial Family Law', detail: 'Courts can order that a child\'s passport be held by the court or restrict a parent from removing a child from the province or country.' },
          { right: 'Relocation disputes focus on best interests', section: 'Provincial Family Law', detail: 'When parents disagree about relocation, the court considers the child\'s best interests, the reason for the move, and the impact on relationships.' },
        ]
      },
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
          { right: 'A child protection worker must investigate', section: 'Section 9', detail: 'An investigation must be conducted when there are reasonable grounds to believe a child needs protection.' },
          { right: 'You have the right to a lawyer', section: 'General', detail: 'Contact the NWT Law Line at 867-920-6356 for free legal information.' },
          { right: 'Support services should be offered', section: 'Section 7', detail: 'The Act emphasizes preventive services and support to families.' },
          { right: 'A warrant is required to enter your home', section: 'Section 13', detail: 'Workers need a court order unless the child is in immediate danger.' },
          { right: 'Definition of "child in need of protection" is specific', section: 'Section 7(3)', detail: 'The Act defines specific circumstances that constitute a child being in need of protection.' },
        ]
      },
      {
        id: 'apprehension', title: 'Your Rights During an Apprehension', icon: '⚠️',
        rights: [
          { right: 'You must be notified promptly', section: 'Section 14', detail: 'You must be informed of the apprehension and the reasons for it.' },
          { right: 'A hearing must occur within prescribed timelines', section: 'Section 16', detail: 'The matter must be brought to court promptly after apprehension.' },
          { right: 'Community-based alternatives should be considered', section: 'General', detail: 'In remote NWT communities, culturally appropriate alternatives to apprehension should be explored.' },
        ]
      },
      {
        id: 'court', title: 'Your Rights in Court', icon: '⚖️',
        rights: [
          { right: 'You can challenge any protection order', section: 'General', detail: 'You have the right to present evidence and contest applications.' },
          { right: 'You can appeal decisions', section: 'General', detail: 'You have the right to appeal any order.' },
        ]
      },
      {
        id: 'access', title: 'Your Rights to Access & Visits', icon: '👨‍👩‍👧',
        rights: [
          { right: 'Access provisions can be included in orders', section: 'General', detail: 'The court can order access (visits) between you and your child while in care.' },
          { right: 'Remote community considerations', section: 'General', detail: 'In remote communities, the court may consider alternative access arrangements such as video calls.' },
        ]
      },
      {
        id: 'indigenous', title: 'Indigenous Family Rights', icon: '🪶',
        rights: [
          { right: 'Most NWT children in care are Indigenous', section: 'General', detail: 'The majority of children in care in the NWT are Indigenous. Cultural considerations are paramount in all decisions.' },
          { right: 'Community involvement in child welfare', section: 'General', detail: 'Indigenous communities should be involved in decisions about children from their communities.' },
          { right: 'Federal Act may apply', section: 'Bill C-92', detail: 'Indigenous governing bodies that have established their own child welfare laws may have jurisdiction.' },
        ]
      },
      {
        id: 'complaints', title: 'How to File a Complaint', icon: '📋',
        rights: [
          { right: 'File a complaint with the Department', section: 'General', detail: 'Contact the Department of Health and Social Services to file a formal complaint.' },
          { right: 'Contact the NWT Information and Privacy Commissioner', section: 'General', detail: 'For issues related to access to your records. Call 867-920-8049.' },
        ]
      },
      {
        id: 'custody', title: 'Your Custody Rights', icon: '👨‍👩‍👧‍👦',
        rights: [
          { right: 'Both parents have equal rights unless ordered otherwise', section: 'Provincial Family Law', detail: 'Unless a court order exists, both parents generally have equal rights to custody and decision-making for their children.' },
          { right: 'Best interests of the child is the primary consideration', section: 'Provincial Family Law', detail: 'All custody decisions must be based on the best interests of the child, considering safety, stability, relationships, and the child\'s views.' },
          { right: 'You can represent yourself in court', section: 'Court Rules', detail: 'You have the right to represent yourself in family court proceedings. Many courts have self-help centres to assist unrepresented litigants.' },
          { right: 'Children\'s views are considered', section: 'Provincial Family Law', detail: 'Courts consider the child\'s views and preferences depending on age and maturity when making custody decisions.' },
          { right: 'Mediation may be available or required', section: 'Provincial Family Law', detail: 'Many jurisdictions offer or require mediation before proceeding to a contested custody hearing.' },
        ]
      },
      {
        id: 'support', title: 'Your Child Support Rights', icon: '💰',
        rights: [
          { right: 'Both parents must support their children', section: 'Provincial Family Law', detail: 'Both parents have a legal obligation to financially support their children regardless of custody arrangements.' },
          { right: 'Federal Child Support Guidelines apply', section: 'Federal Guidelines', detail: 'Child support amounts are determined by the Federal Child Support Guidelines tables based on income and number of children.' },
          { right: 'You can request financial disclosure', section: 'Provincial Family Law', detail: 'You have the right to request complete financial disclosure from the other parent to ensure accurate support calculations.' },
          { right: 'Support orders can be enforced', section: 'Provincial Enforcement Program', detail: 'Each province has a maintenance enforcement program that can garnish wages, seize assets, and suspend licenses to enforce support orders.' },
          { right: 'Support can be varied on material change', section: 'Provincial Family Law', detail: 'Either parent can apply to change the support amount if there has been a significant change in circumstances.' },
        ]
      },
      {
        id: 'relocation', title: 'Relocation & Travel Rights', icon: '✈️',
        rights: [
          { right: 'Notice is required before relocating with a child', section: 'Provincial Family Law', detail: 'A parent planning to move with a child must give written notice to the other parent. The required notice period varies by province.' },
          { right: 'Both parents must consent to international travel', section: 'General', detail: 'Taking a child outside Canada typically requires consent of both parents or a court order. Carry a notarized consent letter.' },
          { right: 'Courts can restrict travel', section: 'Provincial Family Law', detail: 'Courts can order that a child\'s passport be held by the court or restrict a parent from removing a child from the province or country.' },
          { right: 'Relocation disputes focus on best interests', section: 'Provincial Family Law', detail: 'When parents disagree about relocation, the court considers the child\'s best interests, the reason for the move, and the impact on relationships.' },
        ]
      },
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
          { right: 'You have the right to a lawyer', section: 'General', detail: 'Contact Yukon Legal Services at 867-667-5210 for free legal assistance.' },
          { right: 'Support services must be considered', section: 'Section 4', detail: 'The Act emphasizes providing services that support family unity and prevent the need for removal.' },
          { right: 'A warrant is required to enter your home', section: 'General', detail: 'Workers need a court order to enter your home unless the child is in immediate danger.' },
          { right: 'First Nations involvement', section: 'Section 5', detail: 'When a child\'s First Nation is identified, the director must give the First Nation notice and an opportunity to be involved.' },
        ]
      },
      {
        id: 'apprehension', title: 'Your Rights During an Apprehension', icon: '⚠️',
        rights: [
          { right: 'You must be notified of the reasons', section: 'Section 28', detail: 'You must be informed of the grounds for apprehension and your right to consult a lawyer.' },
          { right: 'A court hearing must occur promptly', section: 'Section 30', detail: 'The matter must be brought before the court within the prescribed timelines.' },
          { right: 'Placement with family and community is prioritized', section: 'Section 4', detail: 'The Act prioritizes placing children with their family, extended family, or within their community.' },
          { right: 'The director must consider cultural needs', section: 'Section 4', detail: 'The child\'s cultural, linguistic, and spiritual needs must be considered in all decisions.' },
        ]
      },
      {
        id: 'court', title: 'Your Rights in Court', icon: '⚖️',
        rights: [
          { right: 'You can challenge any protection order', section: 'General', detail: 'You have the right to appear in court, present evidence, and contest the director\'s application.' },
          { right: 'You can appeal court decisions', section: 'General', detail: 'You can appeal any order made under the Act.' },
          { right: 'Orders have time limits', section: 'General', detail: 'Protection orders must be reviewed and have maximum durations.' },
        ]
      },
      {
        id: 'access', title: 'Your Rights to Access & Visits', icon: '👨‍👩‍👧',
        rights: [
          { right: 'Access can be included in any order', section: 'General', detail: 'The court can include access provisions allowing you to maintain contact with your child.' },
          { right: 'You can apply to modify access', section: 'General', detail: 'Apply to the court to change access arrangements if circumstances change.' },
        ]
      },
      {
        id: 'indigenous', title: 'Indigenous Family Rights', icon: '🪶',
        rights: [
          { right: 'First Nations must be notified and involved', section: 'Section 5', detail: 'When a child\'s First Nation is identified, the director must give the First Nation notice of proceedings and an opportunity to participate.' },
          { right: 'Cultural placement priority', section: 'Section 4', detail: 'The Act prioritizes placing children in environments consistent with their cultural, linguistic, and spiritual heritage.' },
          { right: 'Self-governing First Nations may exercise jurisdiction', section: 'Bill C-92', detail: 'Yukon has several self-governing First Nations that may establish their own child welfare laws.' },
        ]
      },
      {
        id: 'complaints', title: 'How to File a Complaint', icon: '📋',
        rights: [
          { right: 'Contact the Child and Youth Advocate', section: 'Child and Youth Advocate Act', detail: 'Independent advocate who can investigate complaints about child welfare services. Call 867-456-5575.' },
          { right: 'File a complaint with the Department', section: 'General', detail: 'Contact the Department of Health and Social Services directly.' },
          { right: 'Contact the Yukon Ombudsman', section: 'Ombudsman Act', detail: 'The Ombudsman can investigate complaints about government services. Call 867-667-8468.' },
        ]
      },
      {
        id: 'custody', title: 'Your Custody Rights', icon: '👨‍👩‍👧‍👦',
        rights: [
          { right: 'Both parents have equal rights unless ordered otherwise', section: 'Provincial Family Law', detail: 'Unless a court order exists, both parents generally have equal rights to custody and decision-making for their children.' },
          { right: 'Best interests of the child is the primary consideration', section: 'Provincial Family Law', detail: 'All custody decisions must be based on the best interests of the child, considering safety, stability, relationships, and the child\'s views.' },
          { right: 'You can represent yourself in court', section: 'Court Rules', detail: 'You have the right to represent yourself in family court proceedings. Many courts have self-help centres to assist unrepresented litigants.' },
          { right: 'Children\'s views are considered', section: 'Provincial Family Law', detail: 'Courts consider the child\'s views and preferences depending on age and maturity when making custody decisions.' },
          { right: 'Mediation may be available or required', section: 'Provincial Family Law', detail: 'Many jurisdictions offer or require mediation before proceeding to a contested custody hearing.' },
        ]
      },
      {
        id: 'support', title: 'Your Child Support Rights', icon: '💰',
        rights: [
          { right: 'Both parents must support their children', section: 'Provincial Family Law', detail: 'Both parents have a legal obligation to financially support their children regardless of custody arrangements.' },
          { right: 'Federal Child Support Guidelines apply', section: 'Federal Guidelines', detail: 'Child support amounts are determined by the Federal Child Support Guidelines tables based on income and number of children.' },
          { right: 'You can request financial disclosure', section: 'Provincial Family Law', detail: 'You have the right to request complete financial disclosure from the other parent to ensure accurate support calculations.' },
          { right: 'Support orders can be enforced', section: 'Provincial Enforcement Program', detail: 'Each province has a maintenance enforcement program that can garnish wages, seize assets, and suspend licenses to enforce support orders.' },
          { right: 'Support can be varied on material change', section: 'Provincial Family Law', detail: 'Either parent can apply to change the support amount if there has been a significant change in circumstances.' },
        ]
      },
      {
        id: 'relocation', title: 'Relocation & Travel Rights', icon: '✈️',
        rights: [
          { right: 'Notice is required before relocating with a child', section: 'Provincial Family Law', detail: 'A parent planning to move with a child must give written notice to the other parent. The required notice period varies by province.' },
          { right: 'Both parents must consent to international travel', section: 'General', detail: 'Taking a child outside Canada typically requires consent of both parents or a court order. Carry a notarized consent letter.' },
          { right: 'Courts can restrict travel', section: 'Provincial Family Law', detail: 'Courts can order that a child\'s passport be held by the court or restrict a parent from removing a child from the province or country.' },
          { right: 'Relocation disputes focus on best interests', section: 'Provincial Family Law', detail: 'When parents disagree about relocation, the court considers the child\'s best interests, the reason for the move, and the impact on relationships.' },
        ]
      },
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
          { right: 'A child protection worker must investigate', section: 'Section 9', detail: 'An investigation must be conducted when a child may be in need of protection.' },
          { right: 'You have the right to a lawyer', section: 'General', detail: 'Contact Maliiganik Tukisiiniakvik Legal Aid at 867-979-5377. Available in Inuktitut and English.' },
          { right: 'Inuit cultural values must be considered', section: 'Section 2', detail: 'The Act requires consideration of Inuit societal values, Inuit Qaujimajatuqangit (traditional knowledge), and cultural practices in all decisions.' },
          { right: 'Community-based approaches are encouraged', section: 'General', detail: 'Given the close-knit nature of Nunavut communities, community-based and culturally appropriate approaches should be prioritized.' },
          { right: 'You can have a support person present', section: 'General', detail: 'You can have a family member, Elder, or community advocate present during meetings with workers.' },
        ]
      },
      {
        id: 'apprehension', title: 'Your Rights During an Apprehension', icon: '⚠️',
        rights: [
          { right: 'You must be notified of the apprehension', section: 'Section 14', detail: 'You must be informed of the apprehension and your rights, including the right to a lawyer.' },
          { right: 'A hearing must occur within prescribed timelines', section: 'Section 16', detail: 'The matter must be brought to court promptly. In remote communities, court may occur via circuit court.' },
          { right: 'Community involvement in placement', section: 'Section 30', detail: 'The community should be involved in decisions about the child\'s placement. Extended family and community placements are preferred.' },
          { right: 'Timely review is a constitutional right', section: 'General', detail: 'The Supreme Court of Canada has affirmed that timely review of child apprehensions is a constitutional requirement under Section 7 of the Charter.' },
        ]
      },
      {
        id: 'court', title: 'Your Rights in Court', icon: '⚖️',
        rights: [
          { right: 'You can challenge any protection application', section: 'General', detail: 'You have the right to appear and present your case.' },
          { right: 'You can appeal decisions', section: 'General', detail: 'You can appeal any order made under the Act.' },
          { right: 'Hearings may be by telephone or video', section: 'General', detail: 'In remote communities, court hearings may be conducted by telephone or video to ensure timely access to justice.' },
        ]
      },
      {
        id: 'access', title: 'Your Rights to Access & Visits', icon: '👨‍👩‍👧',
        rights: [
          { right: 'Access provisions can be included in orders', section: 'General', detail: 'The court can order access between you and your child while in care.' },
          { right: 'Remote community considerations', section: 'General', detail: 'Given Nunavut\'s geography, alternative access methods (phone, video) may be considered for families in different communities.' },
        ]
      },
      {
        id: 'indigenous', title: 'Inuit Family Rights', icon: '🪶',
        rights: [
          { right: 'Inuit Qaujimajatuqangit must guide decisions', section: 'Section 2', detail: 'Inuit traditional knowledge and values (Inuit Qaujimajatuqangit) must be considered in all child welfare decisions.' },
          { right: 'Community and Elder involvement', section: 'General', detail: 'Elders and community members should be involved in decision-making about children from their communities.' },
          { right: 'Customary adoption is recognized', section: 'Aboriginal Custom Adoption Recognition Act', detail: 'Nunavut recognizes Inuit customary adoption, which is a traditional practice of the Inuit people.' },
          { right: 'Extended family placements are culturally preferred', section: 'General', detail: 'In Inuit culture, extended family care is a traditional and preferred arrangement. The Act should reflect this.' },
          { right: 'Services should be available in Inuktitut', section: 'General', detail: 'Under the Official Languages Act, services should be available in Inuktitut, Inuinnaqtun, English, and French.' },
        ]
      },
      {
        id: 'complaints', title: 'How to File a Complaint', icon: '📋',
        rights: [
          { right: 'Contact the Representative for Children and Youth', section: 'Representative for Children and Youth Act', detail: 'Independent advocate who can investigate complaints. Call 867-975-5090. Services available in Inuktitut.' },
          { right: 'File a complaint with the Department of Family Services', section: 'General', detail: 'Contact the Department directly to raise concerns about a worker or services.' },
          { right: 'Contact Nunavut Legal Aid', section: 'General', detail: 'Maliiganik Tukisiiniakvik (867-979-5377) or Kivalliq Legal Aid (867-645-2536) can provide legal advice in Inuktitut and English.' },
        ]
      },
      {
        id: 'custody', title: 'Your Custody Rights', icon: '👨‍👩‍👧‍👦',
        rights: [
          { right: 'Both parents have equal rights unless ordered otherwise', section: 'Provincial Family Law', detail: 'Unless a court order exists, both parents generally have equal rights to custody and decision-making for their children.' },
          { right: 'Best interests of the child is the primary consideration', section: 'Provincial Family Law', detail: 'All custody decisions must be based on the best interests of the child, considering safety, stability, relationships, and the child\'s views.' },
          { right: 'You can represent yourself in court', section: 'Court Rules', detail: 'You have the right to represent yourself in family court proceedings. Many courts have self-help centres to assist unrepresented litigants.' },
          { right: 'Children\'s views are considered', section: 'Provincial Family Law', detail: 'Courts consider the child\'s views and preferences depending on age and maturity when making custody decisions.' },
          { right: 'Mediation may be available or required', section: 'Provincial Family Law', detail: 'Many jurisdictions offer or require mediation before proceeding to a contested custody hearing.' },
        ]
      },
      {
        id: 'support', title: 'Your Child Support Rights', icon: '💰',
        rights: [
          { right: 'Both parents must support their children', section: 'Provincial Family Law', detail: 'Both parents have a legal obligation to financially support their children regardless of custody arrangements.' },
          { right: 'Federal Child Support Guidelines apply', section: 'Federal Guidelines', detail: 'Child support amounts are determined by the Federal Child Support Guidelines tables based on income and number of children.' },
          { right: 'You can request financial disclosure', section: 'Provincial Family Law', detail: 'You have the right to request complete financial disclosure from the other parent to ensure accurate support calculations.' },
          { right: 'Support orders can be enforced', section: 'Provincial Enforcement Program', detail: 'Each province has a maintenance enforcement program that can garnish wages, seize assets, and suspend licenses to enforce support orders.' },
          { right: 'Support can be varied on material change', section: 'Provincial Family Law', detail: 'Either parent can apply to change the support amount if there has been a significant change in circumstances.' },
        ]
      },
      {
        id: 'relocation', title: 'Relocation & Travel Rights', icon: '✈️',
        rights: [
          { right: 'Notice is required before relocating with a child', section: 'Provincial Family Law', detail: 'A parent planning to move with a child must give written notice to the other parent. The required notice period varies by province.' },
          { right: 'Both parents must consent to international travel', section: 'General', detail: 'Taking a child outside Canada typically requires consent of both parents or a court order. Carry a notarized consent letter.' },
          { right: 'Courts can restrict travel', section: 'Provincial Family Law', detail: 'Courts can order that a child\'s passport be held by the court or restrict a parent from removing a child from the province or country.' },
          { right: 'Relocation disputes focus on best interests', section: 'Provincial Family Law', detail: 'When parents disagree about relocation, the court considers the child\'s best interests, the reason for the move, and the impact on relationships.' },
        ]
      },
    ]
  },};

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

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, userId: user?.id })
      });

      const data = await response.json();
      const assistantMsg = data.content || 'I apologize, I was unable to process that request. Please try again.';
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
