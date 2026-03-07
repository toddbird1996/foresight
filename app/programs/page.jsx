'use client';
import React, { useState } from 'react';
import Link from 'next/link';

// ============================================
// PROGRAM CATEGORIES
// ============================================
const CATEGORIES = {
  legal_aid: { label: 'Legal Aid & Free Legal Help', icon: '⚖️', color: 'bg-red-50 text-red-700 border-red-200' },
  funding: { label: 'Financial Assistance & Funding', icon: '💰', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  housing: { label: 'Housing Support', icon: '🏠', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  therapy: { label: 'Counselling & Mental Health', icon: '🧠', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  children: { label: 'Programs for Children', icon: '👧', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  domestic_violence: { label: 'Domestic Violence Support', icon: '🛡️', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  mediation: { label: 'Mediation & Dispute Resolution', icon: '🤝', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  parenting: { label: 'Parenting Programs & Education', icon: '👨‍👩‍👧', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
};

// ============================================
// PROGRAMS DATABASE - ALL PROVINCES
// ============================================
const PROGRAMS = {
  national: {
    name: 'Canada-Wide',
    flag: '🇨🇦',
    programs: [
      { category: 'legal_aid', name: 'Department of Justice - Family Law', description: 'Federal family law information including the Divorce Act, child support guidelines, and parenting arrangements.', url: 'https://www.justice.gc.ca/eng/fl-df/', phone: '' },
      { category: 'legal_aid', name: 'Canada Child Support Tables', description: 'Official federal child support lookup tables used across Canada.', url: 'https://www.justice.gc.ca/eng/fl-df/child-enfant/cst-orpe.html', phone: '' },
      { category: 'funding', name: 'Canada Child Benefit (CCB)', description: 'Tax-free monthly payment to eligible families to help with the cost of raising children under 18.', url: 'https://www.canada.ca/en/revenue-agency/services/child-family-benefits/canada-child-benefit-overview.html', phone: '1-800-387-1193' },
      { category: 'domestic_violence', name: 'National Domestic Violence Hotline', description: '24/7 crisis support for anyone experiencing domestic violence.', url: 'https://endingviolencecanada.org/', phone: '1-800-363-9010' },
      { category: 'therapy', name: 'Kids Help Phone', description: '24/7 support for young people — call, text, or chat online. Free and confidential.', url: 'https://kidshelpphone.ca/', phone: '1-800-668-6868' },
      { category: 'therapy', name: 'Crisis Services Canada', description: '24/7 crisis support and suicide prevention for anyone in distress.', url: 'https://www.crisisservicescanada.ca/', phone: '1-833-456-4566' },
      { category: 'children', name: 'Children\'s Aid Society', description: 'Child welfare services available in every province — contact your local office for support.', url: 'https://www.canada.ca/en/public-health/services/child-welfare.html', phone: '' },
    ]
  },
  saskatchewan: {
    name: 'Saskatchewan',
    flag: '🇨🇦',
    programs: [
      { category: 'legal_aid', name: 'Legal Aid Saskatchewan', description: 'Free legal representation for eligible individuals in family law matters.', url: 'https://legalaid.sk.ca/', phone: '1-800-667-3764' },
      { category: 'legal_aid', name: 'PLEA Saskatchewan', description: 'Free legal information on family law, housing, and more. Includes Family Law Saskatchewan form wizard.', url: 'https://plea.org/', phone: '' },
      { category: 'legal_aid', name: 'Family Law Information Centre (FLIC)', description: 'Free help identifying court forms, self-help kits, and referrals to family law services.', url: 'https://www.saskatchewan.ca/residents/births-deaths-marriages-and-divorces/separation-or-divorce/represent-yourself-in-family-court', phone: '1-888-218-2822' },
      { category: 'mediation', name: 'Dispute Resolution Office - Family Mediation', description: 'Provincial mediation service. Fees on a sliding scale based on income.', url: 'https://www.saskatchewan.ca/residents/births-deaths-marriages-and-divorces/separation-or-divorce', phone: '306-787-5747' },
      { category: 'parenting', name: 'For the Children\'s Sake / Parenting After Separation', description: 'Mandatory parenting course for separating parents. Free to attend.', url: 'https://www.saskatchewan.ca/residents/births-deaths-marriages-and-divorces/separation-or-divorce', phone: '' },
      { category: 'funding', name: 'Saskatchewan Social Services', description: 'Income assistance, child care subsidies, and emergency support for families in need.', url: 'https://www.saskatchewan.ca/residents/family-and-social-support', phone: '' },
      { category: 'housing', name: 'Saskatchewan Housing Corporation', description: 'Affordable housing, rental supplements, and emergency shelter for families.', url: 'https://www.saskatchewan.ca/residents/housing', phone: '' },
      { category: 'domestic_violence', name: 'Provincial Association of Transition Houses (PATHS)', description: 'Network of shelters and services for victims of domestic violence across Saskatchewan.', url: 'https://pathssk.org/', phone: '306-522-3515' },
      { category: 'therapy', name: 'Saskatchewan Health Authority - Mental Health', description: 'Free mental health and addictions services across the province.', url: 'https://www.saskhealthauthority.ca/your-health/conditions-diseases-services/mental-health-addictions-services', phone: '811' },
      { category: 'children', name: 'Family Matters Program', description: 'Assists families experiencing separation with information, support, and guidance.', url: 'https://www.saskatchewan.ca/residents/births-deaths-marriages-and-divorces/separation-or-divorce', phone: '' },
      { category: 'funding', name: 'Saskatchewan Income Support (SIS)', description: 'Financial assistance for basic living costs including shelter, food, and utilities for individuals and families with low income.', url: 'https://www.saskatchewan.ca/residents/family-and-social-support/financial-help/saskatchewan-income-support', phone: '' },
      { category: 'funding', name: 'Saskatchewan Employment Incentive (SEI)', description: 'Monthly financial incentive for working families with lower incomes, plus supplementary health benefits and bus passes.', url: 'https://www.saskatchewan.ca/residents/family-and-social-support/financial-help/saskatchewan-employment-incentive', phone: '' },
      { category: 'funding', name: 'Saskatchewan Low-Income Tax Credit', description: 'Up to $1,196/year per family. Combined with quarterly GST credit payments. No application needed — based on tax return.', url: 'https://www.canada.ca/en/revenue-agency/services/child-family-benefits/provincial-territorial-programs/province-saskatchewan.html', phone: '' },
      { category: 'funding', name: 'Child Care Subsidy', description: 'Financial assistance to help with the cost of regulated child care. Parents pay minimum 10% of fees.', url: 'https://www.saskatchewan.ca/residents/family-and-social-support/child-care/paying-for-child-care', phone: '' },
      { category: 'housing', name: 'Saskatchewan Housing Benefit', description: 'Monthly benefit for low-income renters through the Saskatchewan Housing Corporation.', url: 'https://www.saskatchewan.ca/residents/housing', phone: '' },
      { category: 'housing', name: 'Social Housing Program', description: 'Rent set at 30% of household income. Available in 300+ communities across Saskatchewan. Priority for families with children.', url: 'https://www.saskatchewan.ca/residents/housing/find-housing/social-housing', phone: '' },
      { category: 'therapy', name: 'Family Service Saskatchewan', description: 'Counselling services for individuals, couples, and families. Sliding scale fees available.', url: 'https://familyservice.sk.ca/', phone: '' },
      { category: 'children', name: 'Counsel for Children Program', description: 'Free lawyer appointed for children involved in child protection proceedings under the Child and Family Services Act.', url: 'https://www.saskatchewan.ca/residents/justice-crime-and-the-law/courts-and-sentencing/counsel-for-children', phone: '' },
      { category: 'children', name: 'KidsFirst Program', description: 'Home visiting program for vulnerable families with young children. Provides parenting support, child development info, and community connections.', url: 'https://www.saskatchewan.ca/residents/family-and-social-support/child-care', phone: '' },
    ]
  },
  alberta: {
    name: 'Alberta',
    flag: '🇨🇦',
    programs: [
      { category: 'legal_aid', name: 'Legal Aid Alberta', description: 'Free legal services for eligible Albertans in family law, including Emergency Protection Orders.', url: 'https://www.legalaid.ab.ca/', phone: '1-866-845-3425' },
      { category: 'legal_aid', name: 'Alberta Family Court Assistance', description: 'Help for self-represented litigants navigating the family court process.', url: 'https://www.alberta.ca/family-law-assistance', phone: '' },
      { category: 'legal_aid', name: 'Resolution & Court Administration Services (RCAS)', description: 'Court-connected family mediation, parenting coordination, and dispute resolution.', url: 'https://www.alberta.ca/rcas-family-justice-services', phone: '' },
      { category: 'mediation', name: 'Alberta Family Mediation Program', description: 'Subsidized family mediation for parents with gross annual income under $60,000.', url: 'https://www.alberta.ca/family-mediation', phone: '' },
      { category: 'parenting', name: 'Parenting After Separation Course', description: 'Free mandatory course for parents involved in custody proceedings in Alberta.', url: 'https://www.alberta.ca/parenting-after-separation', phone: '' },
      { category: 'funding', name: 'Alberta Child and Family Benefit', description: 'Quarterly tax-free payment to help Alberta families with children.', url: 'https://www.alberta.ca/child-and-family-benefit', phone: '' },
      { category: 'housing', name: 'Alberta Seniors and Housing', description: 'Affordable housing programs, rent supplements, and homeless prevention.', url: 'https://www.alberta.ca/housing-programs-and-services', phone: '' },
      { category: 'domestic_violence', name: 'Alberta Council of Women\'s Shelters', description: 'Network of shelters for women and children fleeing family violence.', url: 'https://acws.ca/', phone: '1-866-331-3933' },
      { category: 'therapy', name: 'Alberta Mental Health Helpline', description: '24/7 confidential mental health support for all Albertans.', url: 'https://www.albertahealthservices.ca/findhealth/service.aspx?Id=6810', phone: '1-877-303-2642' },
      { category: 'children', name: 'Alberta Child Intervention', description: 'Child welfare services and supports for children and families at risk.', url: 'https://www.alberta.ca/child-intervention', phone: '' },
      { category: 'funding', name: 'Alberta Child Care Subsidy', description: 'Income-based subsidy for licensed child care. Apply through the Alberta Child Care Subsidy portal.', url: 'https://www.alberta.ca/child-care-subsidy', phone: '' },
      { category: 'funding', name: 'Alberta Affordability Grant (Child Care)', description: 'Reduces child care fees for children birth to kindergarten age. Automatically applied at licensed programs.', url: 'https://www.alberta.ca/federal-provincial-child-care-agreement', phone: '' },
      { category: 'funding', name: 'Income Support Program', description: 'Financial benefits for Albertans who cannot meet their basic needs — food, clothing, shelter. Includes health benefits.', url: 'https://www.alberta.ca/income-support', phone: '' },
      { category: 'housing', name: 'Rent Supplement Programs', description: 'Provincial and federal rent supplements to help families afford housing in the private market.', url: 'https://www.alberta.ca/housing-programs-and-services', phone: '' },
      { category: 'therapy', name: 'Family Resource Networks', description: 'Community-based family support centres across Alberta providing parenting programs, counselling, and referrals.', url: 'https://www.alberta.ca/family-resource-networks', phone: '' },
      { category: 'children', name: 'Child and Youth Advocate', description: 'Independent advocate who represents the rights and interests of young people receiving child intervention services.', url: 'https://www.ocya.alberta.ca/', phone: '1-800-661-3446' },
      { category: 'domestic_violence', name: 'Family Violence Info Line', description: '24/7 multilingual support line for anyone affected by family violence in Alberta.', url: 'https://www.alberta.ca/family-violence-get-help', phone: '310-1818' },
    ]
  },
  ontario: {
    name: 'Ontario',
    flag: '🇨🇦',
    programs: [
      { category: 'legal_aid', name: 'Legal Aid Ontario', description: 'Free legal representation and duty counsel for eligible Ontarians in family court.', url: 'https://www.legalaid.on.ca/', phone: '1-800-668-8258' },
      { category: 'legal_aid', name: 'CLEO - Steps to Justice', description: 'Free legal information on family law, with guided pathways to fill out court forms.', url: 'https://stepstojustice.ca/', phone: '' },
      { category: 'legal_aid', name: 'Family Law Information Centres (FLICs)', description: 'Free information about family court at courthouses across Ontario.', url: 'https://www.ontario.ca/page/family-law-information-centres', phone: '' },
      { category: 'mediation', name: 'Ontario Family Mediation Service', description: 'Free family mediation available at 45+ sites across Ontario.', url: 'https://www.ontario.ca/page/family-mediation-services', phone: '' },
      { category: 'parenting', name: 'Mandatory Information Program (MIP)', description: 'Required information session for parents starting family court proceedings.', url: 'https://www.ontario.ca/page/mandatory-information-program', phone: '' },
      { category: 'funding', name: 'Ontario Works', description: 'Financial and employment assistance for people in temporary financial need.', url: 'https://www.ontario.ca/page/apply-ontario-works', phone: '' },
      { category: 'housing', name: 'Ontario Housing Benefits', description: 'Portable housing benefit and social housing programs for low-income families.', url: 'https://www.ontario.ca/page/co-operative-and-social-housing', phone: '' },
      { category: 'domestic_violence', name: 'Assaulted Women\'s Helpline', description: '24/7 crisis line for women experiencing violence in Ontario.', url: 'https://www.awhl.org/', phone: '1-866-863-0511' },
      { category: 'therapy', name: 'ConnexOntario', description: 'Free information and referrals for mental health, addictions, and gambling services.', url: 'https://www.connexontario.ca/', phone: '1-866-531-2600' },
      { category: 'children', name: 'Office of the Children\'s Lawyer', description: 'Provides legal representation and clinical services for children in custody cases.', url: 'https://www.ontario.ca/page/office-childrens-lawyer', phone: '' },
      { category: 'funding', name: 'Ontario Child Care Subsidy', description: 'Income-tested subsidy to help families with the cost of licensed child care. Apply through your municipal service manager.', url: 'https://www.ontario.ca/page/child-care-subsidies', phone: '' },
      { category: 'funding', name: 'Ontario Disability Support Program (ODSP)', description: 'Income support and benefits for people with disabilities and their families.', url: 'https://www.ontario.ca/page/ontario-disability-support-program', phone: '' },
      { category: 'funding', name: 'Ontario Trillium Benefit', description: 'Combined payment for Ontario energy and property tax credit, Northern Ontario energy credit, and Ontario sales tax credit.', url: 'https://www.ontario.ca/page/ontario-trillium-benefit', phone: '' },
      { category: 'housing', name: 'Canada-Ontario Housing Benefit', description: 'Monthly portable housing benefit for eligible low-income families. You choose where you live.', url: 'https://www.ontario.ca/page/canada-ontario-housing-benefit', phone: '' },
      { category: 'therapy', name: 'Family Health Teams', description: 'Community-based primary health care including mental health counselling, social work, and family support.', url: 'https://www.ontario.ca/page/family-health-teams', phone: '' },
      { category: 'therapy', name: 'BounceBack Ontario', description: 'Free guided self-help program for adults and youth 15+ experiencing low mood, anxiety, or stress.', url: 'https://bouncebackontario.ca/', phone: '1-866-345-0224' },
      { category: 'children', name: 'Ontario Child Benefit', description: 'Up to $1,607 per child per year for eligible low-to-moderate income families.', url: 'https://www.ontario.ca/page/ontario-child-benefit', phone: '' },
      { category: 'domestic_violence', name: 'Victim Support Line', description: '24/7 referral and information line for victims of crime in Ontario.', url: 'https://www.ontario.ca/page/get-help-if-you-are-victim-crime', phone: '1-888-579-2888' },
      { category: 'children', name: 'Better Beginnings, Better Futures', description: 'Community-based program for families with young children in high-risk neighbourhoods — parenting support, child development, home visiting.', url: 'https://bbbf.ca/', phone: '' },
    ]
  },
  bc: {
    name: 'British Columbia',
    flag: '🇨🇦',
    programs: [
      { category: 'legal_aid', name: 'Legal Aid BC', description: 'Free legal representation, duty counsel, and family law advice.', url: 'https://legalaid.bc.ca/', phone: '1-866-577-2525' },
      { category: 'legal_aid', name: 'Family Law in BC', description: 'Comprehensive family law information including a free online tool to fill out court forms.', url: 'https://family.legalaid.bc.ca/', phone: '1-855-875-8867' },
      { category: 'legal_aid', name: 'Clicklaw', description: 'Free BC-focused legal information from trusted agencies and organizations.', url: 'https://www.clicklaw.bc.ca/', phone: '' },
      { category: 'mediation', name: 'BC Family Justice Counsellors', description: 'Free dispute resolution services at Family Justice Centres across BC.', url: 'https://www2.gov.bc.ca/gov/content/life-events/divorce/family-justice/who-can-help/family-justice-counsellors', phone: '' },
      { category: 'parenting', name: 'Parenting After Separation Program', description: 'Free online course for parents going through separation.', url: 'https://www2.gov.bc.ca/gov/content/life-events/divorce/family-justice/parenting-after-separation', phone: '' },
      { category: 'funding', name: 'BC Employment and Assistance', description: 'Income and disability assistance for individuals and families in need.', url: 'https://www2.gov.bc.ca/gov/content/family-social-supports/income-assistance', phone: '' },
      { category: 'housing', name: 'BC Housing', description: 'Subsidized housing, rent supplements, and emergency shelter for families.', url: 'https://www.bchousing.org/', phone: '604-433-2218' },
      { category: 'domestic_violence', name: 'VictimLink BC', description: '24/7 crisis line for victims of family and sexual violence in BC.', url: 'https://www2.gov.bc.ca/gov/content/justice/criminal-justice/victims-of-crime/victimlinkbc', phone: '1-800-563-0808' },
      { category: 'therapy', name: 'BC Mental Health Support Line', description: '24/7 confidential mental health crisis support.', url: 'https://www2.gov.bc.ca/gov/content/health/managing-your-health/mental-health-substance-use', phone: '310-6789' },
      { category: 'children', name: 'BC Representative for Children and Youth', description: 'Independent advocacy for children and youth in government care.', url: 'https://rcybc.ca/', phone: '1-800-476-3933' },
      { category: 'funding', name: 'BC Child Care Fee Reduction Initiative', description: 'Reduces parent fees at participating licensed facilities by up to $900/month for under 3 and $350/month for 3-5.', url: 'https://www2.gov.bc.ca/gov/content/family-social-supports/caring-for-young-children/child-care-funding/child-care-fee-reduction-initiative', phone: '' },
      { category: 'funding', name: 'Affordable Child Care Benefit', description: 'Income-tested benefit for families using licensed child care. Can cover up to 100% of child care fees for low-income families.', url: 'https://www2.gov.bc.ca/gov/content/family-social-supports/caring-for-young-children/child-care-funding/child-care-benefit', phone: '' },
      { category: 'funding', name: 'BC Income Assistance', description: 'Financial support for basic needs for people in hardship. Includes shelter, food, and transportation allowances.', url: 'https://www2.gov.bc.ca/gov/content/family-social-supports/income-assistance', phone: '1-866-866-0800' },
      { category: 'funding', name: 'BC Family Benefit', description: 'Tax-free monthly payment for families with children under 18. Up to $1,750 per child per year.', url: 'https://www2.gov.bc.ca/gov/content/taxes/income-taxes/personal/credits/family-benefit', phone: '' },
      { category: 'housing', name: 'BC Rental Assistance Program', description: 'Cash assistance for working families with low income who are renting. Up to $1,387/month depending on family size.', url: 'https://www.bchousing.org/housing-assistance/rental-assistance-financial-aid-702702702702702702702702/rental-assistance-program', phone: '' },
      { category: 'therapy', name: 'BC 211', description: 'Free helpline connecting people to community, social, and government services including counselling and family support.', url: 'https://bc211.ca/', phone: '211' },
      { category: 'children', name: 'BC Early Childhood Development Programs', description: 'Free early childhood programs including StrongStart centres, Ready Set Learn, and family drop-in programs.', url: 'https://www2.gov.bc.ca/gov/content/education-training/early-learning', phone: '' },
      { category: 'domestic_violence', name: 'BC Society of Transition Houses', description: 'Network of over 100 transition houses, safe homes, and second-stage housing programs across BC.', url: 'https://bcsth.ca/', phone: '' },
    ]
  },
  manitoba: {
    name: 'Manitoba',
    flag: '🇨🇦',
    programs: [
      { category: 'legal_aid', name: 'Legal Aid Manitoba', description: 'Free legal services for eligible Manitobans in family law matters.', url: 'https://www.legalaid.mb.ca/', phone: '1-800-261-2960' },
      { category: 'mediation', name: 'Family Conciliation Services', description: 'Free mediation and family dispute resolution for separating parents.', url: 'https://www.gov.mb.ca/familylaw/resolution/conciliation.html', phone: '204-945-7236' },
      { category: 'parenting', name: 'For the Sake of the Children', description: 'Mandatory parenting education for separating families.', url: 'https://www.gov.mb.ca/familylaw/programs/children.html', phone: '' },
      { category: 'funding', name: 'Manitoba Employment & Income Assistance', description: 'Financial support for basic needs including food, clothing, and shelter.', url: 'https://www.gov.mb.ca/fs/eia/', phone: '' },
      { category: 'housing', name: 'Manitoba Housing', description: 'Social housing and rent-geared-to-income housing for families in need.', url: 'https://www.gov.mb.ca/housing/', phone: '' },
      { category: 'domestic_violence', name: 'Manitoba Domestic Violence Crisis Line', description: '24/7 crisis support for victims of domestic violence.', url: 'https://www.gov.mb.ca/stoptheviolence/', phone: '1-877-977-0007' },
      { category: 'therapy', name: 'Manitoba Mental Health Crisis Line', description: '24/7 crisis support for mental health concerns.', url: '', phone: '1-888-322-3019' },
      { category: 'funding', name: 'Manitoba Child Care Subsidy', description: 'Income-tested subsidy for licensed child care. Apply online or by mail.', url: 'https://www.gov.mb.ca/fs/childcare/families/subsidy.html', phone: '' },
      { category: 'funding', name: 'Manitoba Prenatal Benefit', description: 'Monthly benefit for pregnant people with low income to help with nutritional needs.', url: 'https://www.gov.mb.ca/healthyliving/hlp/prenatal.html', phone: '' },
      { category: 'housing', name: 'Manitoba Housing Authority', description: 'Social housing and rent-geared-to-income housing across Manitoba. Priority for families with children.', url: 'https://www.gov.mb.ca/housing/', phone: '' },
      { category: 'children', name: 'Families First Program', description: 'Home visiting program for families with newborns. Provides parenting support and connects families to community resources.', url: 'https://www.gov.mb.ca/healthyliving/hlp/familiesfirst.html', phone: '' },
      { category: 'children', name: 'Manitoba Advocate for Children and Youth', description: 'Independent advocate who reviews the quality of services for children in care and investigates complaints.', url: 'https://manitobaadvocate.ca/', phone: '1-800-263-7146' },
      { category: 'therapy', name: 'Klinic Community Health', description: 'Free counselling services including sexual assault crisis, domestic violence support, and general counselling in Winnipeg.', url: 'https://klinic.mb.ca/', phone: '204-784-4090' },
    ]
  },
  quebec: {
    name: 'Quebec',
    flag: '🇨🇦',
    programs: [
      { category: 'legal_aid', name: 'Commission des services juridiques (Legal Aid)', description: 'Free legal services for eligible Quebec residents in family law matters.', url: 'https://www.csj.qc.ca/commission-des-services-juridiques/en/home.html', phone: '' },
      { category: 'legal_aid', name: 'Éducaloi', description: 'Free legal information and tools including family law templates and guides in English and French.', url: 'https://educaloi.qc.ca/en/', phone: '' },
      { category: 'legal_aid', name: 'JuridiQC', description: 'Free online guided tool for preparing joint divorce applications in Quebec.', url: 'https://juridiqc.gouv.qc.ca/en/', phone: '' },
      { category: 'mediation', name: 'Quebec Family Mediation (5 Free Sessions)', description: 'Parents with children are entitled to 5 free sessions with an accredited mediator.', url: 'https://www.justice.gouv.qc.ca/en/couples-and-families/separation-and-divorce/', phone: '' },
      { category: 'funding', name: 'Quebec Family Allowance', description: 'Provincial benefit for families with children under 18.', url: 'https://www.rrq.gouv.qc.ca/en/programmes/soutien_enfants/Pages/soutien_enfants.aspx', phone: '' },
      { category: 'domestic_violence', name: 'SOS Violence Conjugale', description: '24/7 bilingual crisis line for victims of domestic violence in Quebec.', url: 'https://sosviolenceconjugale.ca/en', phone: '1-800-363-9010' },
      { category: 'therapy', name: 'Tel-Aide', description: '24/7 confidential listening and support line.', url: 'https://www.telaide.org/', phone: '514-935-1101' },
      { category: 'children', name: 'Direction de la protection de la jeunesse (DPJ)', description: 'Quebec youth protection services for children at risk.', url: 'https://www.quebec.ca/en/family-and-support-for-individuals/childhood/youth-protection', phone: '' },
      { category: 'funding', name: 'Quebec Family Allowance', description: 'Provincial benefit for families with children under 18. Up to $2,903 per child per year depending on income.', url: 'https://www.rrq.gouv.qc.ca/en/programmes/soutien_enfants/Pages/soutien_enfants.aspx', phone: '' },
      { category: 'funding', name: 'Quebec Reduced-Contribution Child Care ($8.70/day)', description: 'Subsidized child care at $8.70/day in licensed centres and home daycares. Apply through the waiting list.', url: 'https://www.mfa.gouv.qc.ca/en/services-de-garde/parents/Pages/index.aspx', phone: '' },
      { category: 'funding', name: 'Social Assistance (Aide sociale)', description: 'Financial assistance for basic needs for individuals and families with no or insufficient income.', url: 'https://www.quebec.ca/en/employment/social-assistance-social-solidarity/social-assistance-program', phone: '' },
      { category: 'housing', name: 'Société d\'habitation du Québec (SHQ)', description: 'Social and affordable housing, rent supplements, and home adaptation programs for Quebec families.', url: 'https://www.habitation.gouv.qc.ca/english.html', phone: '' },
      { category: 'therapy', name: 'CLSC Services (Local Community Service Centres)', description: 'Free front-line health and social services including family counselling, social work, and crisis intervention at CLSCs across Quebec.', url: 'https://www.quebec.ca/en/health/finding-a-resource/clsc', phone: '' },
      { category: 'legal_aid', name: 'Juripop', description: 'Affordable legal services for people who don\'t qualify for legal aid but can\'t afford a private lawyer.', url: 'https://juripop.org/en/', phone: '' },
      { category: 'children', name: 'La Ligne Parents', description: '24/7 support line for parents. Free, confidential, bilingual.', url: 'https://ligneparents.com/', phone: '1-800-361-5085' },
    ]
  },
  nova_scotia: {
    name: 'Nova Scotia',
    flag: '🇨🇦',
    programs: [
      { category: 'legal_aid', name: 'Nova Scotia Legal Aid', description: 'Free legal services for eligible Nova Scotians in family matters.', url: 'https://www.nslegalaid.ca/', phone: '902-420-6573' },
      { category: 'legal_aid', name: 'Nova Scotia Family Law Information', description: 'Comprehensive guide to family law court forms and processes.', url: 'https://www.nsfamilylaw.ca/', phone: '' },
      { category: 'mediation', name: 'Conciliation Services (Supreme Court)', description: 'Court-connected conciliation service for family disputes.', url: 'https://www.nsfamilylaw.ca/', phone: '' },
      { category: 'funding', name: 'Nova Scotia Income Assistance', description: 'Financial assistance for basic needs for individuals and families.', url: 'https://novascotia.ca/coms/employment/income_assistance/', phone: '' },
      { category: 'domestic_violence', name: 'Transition House Association of Nova Scotia', description: 'Network of shelters for women and children fleeing violence.', url: 'https://thans.ca/', phone: '1-855-225-0220' },
      { category: 'therapy', name: 'Nova Scotia Mental Health Crisis Line', description: '24/7 provincial crisis support.', url: '', phone: '1-888-429-8167' },
      { category: 'funding', name: 'Nova Scotia Child Care Subsidy', description: 'Income-tested subsidy to help families with the cost of licensed child care.', url: 'https://www.novascotia.ca/coms/families/childcare/ChildCareSubsidy.html', phone: '' },
      { category: 'funding', name: 'Nova Scotia Child Benefit', description: 'Monthly benefit for families with children. Combined with the Canada Child Benefit.', url: 'https://www.canada.ca/en/revenue-agency/services/child-family-benefits/provincial-territorial-programs/province-nova-scotia.html', phone: '' },
      { category: 'housing', name: 'Housing Nova Scotia', description: 'Public housing, rent supplements, and housing repair programs for low-income families.', url: 'https://housing.novascotia.ca/', phone: '' },
      { category: 'children', name: 'Family Resource Centres', description: 'Community-based centres offering parenting programs, play groups, and family support across Nova Scotia.', url: 'https://www.novascotia.ca/coms/families/', phone: '' },
      { category: 'legal_aid', name: 'Nova Scotia Barristers\' Society Lawyer Referral Service', description: 'Free 30-minute consultation with a lawyer to discuss your legal options.', url: 'https://nsbs.org/for-the-public/finding-a-lawyer/lawyer-referral-service/', phone: '1-800-665-9779' },
    ]
  },
  new_brunswick: {
    name: 'New Brunswick',
    flag: '🇨🇦',
    programs: [
      { category: 'legal_aid', name: 'Legal Aid New Brunswick', description: 'Free legal services for eligible residents in family law matters.', url: 'https://www.legalaidnb.ca/', phone: '1-800-442-4862' },
      { category: 'mediation', name: 'Family Mediation Services', description: 'Free family mediation through the Department of Justice.', url: 'https://www2.gnb.ca/content/gnb/en/services/services_renderer.201316.Family_Mediation_Services.html', phone: '' },
      { category: 'parenting', name: 'Parent Information Program', description: 'Mandatory education session for separating parents.', url: '', phone: '' },
      { category: 'domestic_violence', name: 'Chimo Helpline', description: '24/7 bilingual crisis line for New Brunswick.', url: 'https://www.chimohelpline.ca/', phone: '1-800-667-5005' },
      { category: 'funding', name: 'NB Social Development', description: 'Income support, housing assistance, and family services.', url: 'https://www2.gnb.ca/content/gnb/en/departments/social_development.html', phone: '' },
      { category: 'funding', name: 'NB Child Day Care Subsidy', description: 'Subsidy to help families with the cost of licensed child care based on income.', url: 'https://www2.gnb.ca/content/gnb/en/services/services_renderer.200965.Child_Day_Care_Services_Subsidy.html', phone: '' },
      { category: 'housing', name: 'NB Housing', description: 'Social housing, rent supplements, and housing repair programs for families in need.', url: 'https://www2.gnb.ca/content/gnb/en/departments/social_development/housing.html', phone: '' },
      { category: 'therapy', name: 'NB Mental Health Services', description: 'Free mental health services through regional health authorities across New Brunswick.', url: 'https://www2.gnb.ca/content/gnb/en/departments/health/MentalHealth.html', phone: '' },
      { category: 'children', name: 'NB Child and Youth Advocate', description: 'Independent advocate for children and youth in government services.', url: 'https://www.cyanb.ca/', phone: '1-888-465-1100' },
      { category: 'children', name: 'Family Resource Centres', description: 'Community-based family support including parenting programs, early childhood development, and family counselling.', url: '', phone: '' },
    ]
  },
  newfoundland: {
    name: 'Newfoundland & Labrador',
    flag: '🇨🇦',
    programs: [
      { category: 'legal_aid', name: 'Legal Aid Newfoundland & Labrador', description: 'Free legal services in family law for eligible residents.', url: 'https://www.legalaid.nl.ca/', phone: '1-800-563-9911' },
      { category: 'mediation', name: 'Family Justice Services', description: 'Free mediation and dispute resolution for separating families.', url: '', phone: '' },
      { category: 'domestic_violence', name: 'Provincial Crisis Line', description: '24/7 crisis support for violence and mental health.', url: '', phone: '1-888-737-4668' },
      { category: 'funding', name: 'Income Support Program', description: 'Financial assistance for basic needs.', url: 'https://www.gov.nl.ca/ecc/income-support/', phone: '' },
      { category: 'funding', name: 'NL Child Care Subsidy', description: 'Income-tested subsidy for regulated child care services in Newfoundland and Labrador.', url: 'https://www.gov.nl.ca/education/early-learning/childcare/', phone: '' },
      { category: 'funding', name: 'NL Mother Baby Nutrition Supplement', description: 'Monthly benefit for pregnant women and families with children under one year who receive income support.', url: 'https://www.gov.nl.ca/ecc/income-support/', phone: '' },
      { category: 'housing', name: 'Newfoundland & Labrador Housing Corporation', description: 'Social housing, rental assistance, and home repair programs for low-income families.', url: 'https://www.nlhc.nl.ca/', phone: '' },
      { category: 'therapy', name: 'NL Mental Health Crisis Line', description: '24/7 crisis support.', url: '', phone: '1-888-737-4668' },
      { category: 'children', name: 'Child and Youth Advocate NL', description: 'Independent advocate for children and youth involved in government services.', url: 'https://www.childandyouthadvocate.nl.ca/', phone: '1-877-753-3840' },
      { category: 'children', name: 'Family Resource Centres', description: '35+ family resource centres across the province offering parenting programs, early childhood development, and family support.', url: '', phone: '' },
    ]
  },
  pei: {
    name: 'Prince Edward Island',
    flag: '🇨🇦',
    programs: [
      { category: 'legal_aid', name: 'Legal Aid PEI', description: 'Free legal services for eligible residents in family law.', url: 'https://www.legalaidpei.ca/', phone: '902-368-6043' },
      { category: 'legal_aid', name: 'Community Legal Information Association (CLIA)', description: 'Free legal information and self-help guides for PEI residents.', url: 'https://www.cliapei.ca/', phone: '902-892-0853' },
      { category: 'mediation', name: 'Child Focused Parenting Plan Mediation', description: 'Free mediation to help parents create parenting plans.', url: '', phone: '' },
      { category: 'domestic_violence', name: 'PEI Family Violence Prevention Services', description: 'Crisis support and shelter for victims of family violence.', url: 'https://www.fvps.ca/', phone: '1-800-240-9894' },
      { category: 'funding', name: 'PEI Social Assistance', description: 'Financial assistance for individuals and families in need.', url: 'https://www.princeedwardisland.ca/en/information/social-development-and-housing/social-assistance-program', phone: '' },
      { category: 'funding', name: 'PEI Child Care Subsidy', description: 'Income-tested subsidy for licensed child care. PEI has moved toward $10/day child care.', url: 'https://www.princeedwardisland.ca/en/information/education-and-early-years/child-care-subsidy-program', phone: '' },
      { category: 'housing', name: 'PEI Housing Programs', description: 'Social housing, rent supplements, and housing repair for low-income families.', url: 'https://www.princeedwardisland.ca/en/topic/housing', phone: '' },
      { category: 'therapy', name: 'PEI Mental Health and Addictions', description: 'Free mental health services through Health PEI.', url: 'https://www.healthpei.ca/mentalhealth', phone: '' },
      { category: 'children', name: 'PEI Family Resource Centres', description: 'Community-based family support including parenting programs, child development activities, and family counselling.', url: '', phone: '' },
    ]
  },
  northwest_territories: {
    name: 'Northwest Territories',
    flag: '🇨🇦',
    programs: [
      { category: 'legal_aid', name: 'Legal Aid NWT', description: 'Free legal services for eligible residents.', url: 'https://www.justice.gov.nt.ca/en/legal-aid/', phone: '867-920-6356' },
      { category: 'legal_aid', name: 'Law Line', description: 'Free legal information for NWT residents.', url: '', phone: '867-920-6356' },
      { category: 'domestic_violence', name: 'NWT Help Line', description: '24/7 crisis and support line.', url: '', phone: '1-800-661-0844' },
      { category: 'funding', name: 'NWT Income Assistance', description: 'Financial support for basic needs.', url: 'https://www.ece.gov.nt.ca/en/services/income-security', phone: '' },
      { category: 'funding', name: 'NWT Child Care Subsidy', description: 'Subsidy to help families afford licensed child care in the Northwest Territories.', url: 'https://www.ece.gov.nt.ca/en/services/early-childhood-programs', phone: '' },
      { category: 'housing', name: 'NWT Housing Corporation', description: 'Social housing, homeownership programs, and housing repair for NWT residents.', url: 'https://www.nwthc.gov.nt.ca/', phone: '' },
      { category: 'therapy', name: 'NWT Counselling Services', description: 'Free community counselling through the Department of Health and Social Services.', url: '', phone: '' },
      { category: 'children', name: 'Healthy Family Program', description: 'Home visiting program for families with young children in the NWT.', url: '', phone: '' },
    ]
  },
  yukon: {
    name: 'Yukon',
    flag: '🇨🇦',
    programs: [
      { category: 'legal_aid', name: 'Yukon Legal Services Society', description: 'Free legal representation for eligible Yukoners.', url: 'https://legalaid.yk.ca/', phone: '867-667-5210' },
      { category: 'legal_aid', name: 'Family Law Information Centre', description: 'Free legal information and family mediation services.', url: '', phone: '867-667-3083' },
      { category: 'domestic_violence', name: 'VictimLINK Yukon', description: '24/7 crisis support for victims of violence.', url: '', phone: '1-800-563-0808' },
      { category: 'funding', name: 'Yukon Social Assistance', description: 'Financial assistance for individuals and families.', url: 'https://yukon.ca/en/social-assistance', phone: '' },
      { category: 'funding', name: 'Yukon Child Care Subsidy', description: 'Subsidy for licensed child care. Yukon is working toward $10/day child care.', url: 'https://yukon.ca/en/child-care-subsidy', phone: '' },
      { category: 'housing', name: 'Yukon Housing Corporation', description: 'Social housing, rent supplements, and housing programs for Yukon families.', url: 'https://yukon.ca/en/housing-corporation', phone: '' },
      { category: 'therapy', name: 'Many Rivers Counselling', description: 'Affordable counselling services for individuals, couples, and families in Whitehorse and communities across Yukon.', url: 'https://manyrivers.yk.ca/', phone: '867-667-2970' },
      { category: 'children', name: 'Yukon Child and Youth Advocate', description: 'Independent advocate for children and youth involved in government services.', url: 'https://ycya.ca/', phone: '867-456-5575' },
    ]
  },
  nunavut: {
    name: 'Nunavut',
    flag: '🇨🇦',
    programs: [
      { category: 'legal_aid', name: 'Maliiganik Tukisiiniakvik Legal Aid', description: 'Free legal services for eligible Nunavummiut. Available in Inuktitut and English.', url: '', phone: '867-979-5377' },
      { category: 'domestic_violence', name: 'Nunavut Kamatsiaqtut Help Line', description: '24/7 crisis support line. Available in Inuktitut and English.', url: '', phone: '1-800-265-3333' },
      { category: 'funding', name: 'Nunavut Income Assistance', description: 'Financial assistance for basic needs.', url: '', phone: '' },
      { category: 'therapy', name: 'Nunavut Mental Health Line', description: 'Crisis and mental health support.', url: '', phone: '1-800-265-3333' },
      { category: 'funding', name: 'Nunavut Child Care Subsidy', description: 'Financial support for families to access licensed child care in Nunavut communities.', url: '', phone: '' },
      { category: 'housing', name: 'Nunavut Housing Corporation', description: 'Public housing and housing programs for Nunavut residents. Waitlists may apply.', url: 'https://www.nunavuthousing.ca/', phone: '' },
      { category: 'children', name: 'Nunavut Representative for Children and Youth', description: 'Independent advocate for children and youth. Services in Inuktitut and English.', url: '', phone: '867-975-5090' },
      { category: 'children', name: 'Inuuqatigiit Centre for Inuit Children, Youth and Families', description: 'Culturally-based programs and services for Inuit families. Based in Ottawa but serves Inuit nationally.', url: 'https://inuuqatigiit.ca/', phone: '' },
    ]
  },
};

// ============================================
// PROGRAMS PAGE COMPONENT
// ============================================
export default function ProgramsPage() {
  const [selectedProvince, setSelectedProvince] = useState('national');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const provinceData = PROGRAMS[selectedProvince];
  const allProvinceKeys = Object.keys(PROGRAMS);

  const filteredPrograms = (provinceData?.programs || []).filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Group by category for display
  const groupedPrograms = filteredPrograms.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/dashboard" className="text-gray-400 hover:text-red-600 text-lg">←</Link>
            <h1 className="text-xl font-bold text-gray-900">Programs & Resources</h1>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Free and low-cost programs for legal aid, housing, therapy, children&apos;s support, domestic violence help, and more.
          </p>

          {/* Province Selector */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <select
              value={selectedProvince}
              onChange={(e) => { setSelectedProvince(e.target.value); setSelectedCategory('all'); }}
              className="flex-1 p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-gray-900 text-sm"
            >
              <option value="national">🇨🇦 Canada-Wide Resources</option>
              <optgroup label="Provinces">
                {allProvinceKeys.filter(k => k !== 'national').map(k => (
                  <option key={k} value={k}>{PROGRAMS[k].flag} {PROGRAMS[k].name}</option>
                ))}
              </optgroup>
            </select>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search programs..."
              className="flex-1 p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-gray-900 text-sm placeholder-gray-400"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-thin">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === 'all' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === key ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Province Header */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">{provinceData?.flag}</span>
          <div>
            <h2 className="font-bold text-gray-900 text-lg">{provinceData?.name}</h2>
            <p className="text-sm text-gray-500">{filteredPrograms.length} programs available</p>
          </div>
        </div>

        {/* Programs by Category */}
        {Object.keys(groupedPrograms).length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <span className="text-4xl block mb-3">🔍</span>
            <p className="text-lg font-medium text-gray-600">No programs found</p>
            <p className="text-sm">Try a different province or category.</p>
          </div>
        ) : (
          Object.entries(groupedPrograms).map(([catKey, programs]) => {
            const cat = CATEGORIES[catKey];
            return (
              <div key={catKey}>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>{cat.icon}</span> {cat.label}
                </h3>
                <div className="space-y-3">
                  {programs.map((program, i) => (
                    <div key={i} className={`bg-white border rounded-xl p-4 hover:border-red-300 transition-colors ${cat.color.includes('border') ? '' : 'border-gray-200'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{program.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{program.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {program.url && (
                              <a
                                href={program.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-lg hover:bg-red-100 transition-colors"
                              >
                                🌐 Visit Website
                              </a>
                            )}
                            {program.phone && (
                              <a
                                href={`tel:${program.phone.replace(/[^0-9+]/g, '')}`}
                                className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg hover:bg-emerald-100 transition-colors"
                              >
                                📞 {program.phone}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}

        {/* USA Coming Soon */}
        <div className="bg-gray-100 border border-gray-200 rounded-xl p-6 text-center">
          <span className="text-3xl block mb-2">🇺🇸</span>
          <h3 className="font-bold text-gray-900 mb-2">United States — Coming Soon</h3>
          <p className="text-sm text-gray-600">
            Programs and resources for US states are being researched and will be added in a future update.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h4 className="font-semibold text-amber-800 mb-1">⚠️ Important</h4>
          <p className="text-sm text-amber-700">
            This is a directory of publicly available programs and resources. Foresight does not endorse or guarantee any specific program. 
            Eligibility requirements, availability, and services may change. Always contact the program directly to confirm current details.
          </p>
        </div>
      </main>
    </div>
  );
}
