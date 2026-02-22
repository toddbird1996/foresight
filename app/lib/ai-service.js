// ============================================
// FORESIGHT - AI SERVICE (Claude Integration)
// ============================================

// ============================================
// CONFIGURATION
// ============================================

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

// Get API key from environment
const getApiKey = () => {
  return process.env.ANTHROPIC_API_KEY || 
         process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY ||
         process.env.REACT_APP_ANTHROPIC_API_KEY;
};

// ============================================
// JURISDICTION-SPECIFIC KNOWLEDGE
// ============================================

const JURISDICTION_KNOWLEDGE = {
  saskatchewan: {
    name: "Saskatchewan",
    court: "Court of King's Bench",
    legislation: [
      "The Children's Law Act, 2020",
      "The Family Maintenance Act, 1997", 
      "Divorce Act (Federal)"
    ],
    filingFees: {
      contested: 300,
      uncontested: 500,
      other: 200
    },
    keyProcesses: {
      fdr: "Family Dispute Resolution (FDR) is mandatory before filing. You need a Certificate of Compliance.",
      parentingCourse: "For Kids' Sake parenting course is mandatory for all parties.",
      jcc: "Judicial Case Conference (JCC) is typically required before trial. File FAM-PD 7-2 to request one.",
      service: "Documents must be served personally. Respondent has 30 days to respond (60 days if outside Canada)."
    },
    forms: {
      petition: "Petition (Form)",
      financialStatement: "Financial Statement", 
      affidavitOfService: "Affidavit of Personal Service",
      jccRequest: "FAM-PD 7-2 (Request for JCC)",
      jccBrief: "FAM-PD 7-5 (JCC Brief)"
    },
    courtLocations: [
      "Regina (Main)", "Saskatoon", "Prince Albert", "Moose Jaw", 
      "Swift Current", "Yorkton", "North Battleford", "Estevan"
    ],
    resources: {
      website: "https://sasklawcourts.ca",
      selfHelp: "https://sasklawcourts.ca/family"
    }
  },
  
  alberta: {
    name: "Alberta",
    court: "Court of King's Bench / Alberta Court of Justice",
    legislation: [
      "Family Law Act",
      "Divorce Act (Federal)"
    ],
    filingFees: {
      contested: 260,
      uncontested: 400,
      other: 200
    },
    keyProcesses: {
      pas: "Parenting After Separation (PAS) course is mandatory.",
      adr: "Alternative Dispute Resolution must be attempted before court.",
      mit: "Mandatory Information Tables (MIT) session required.",
      caseConference: "Case conferences are used to narrow issues before trial."
    },
    forms: {
      statementOfClaim: "Statement of Claim for Divorce",
      financialStatement: "Financial Statement (Form FL-12)",
      parentingPlan: "Parenting Plan"
    },
    resources: {
      website: "https://albertacourts.ca",
      resolution: "https://www.alberta.ca/family-justice-services"
    }
  },
  
  ontario: {
    name: "Ontario",
    court: "Superior Court of Justice / Ontario Court of Justice",
    legislation: [
      "Family Law Act",
      "Children's Law Reform Act",
      "Divorce Act (Federal)"
    ],
    filingFees: {
      application: 202,
      divorce_registration: 10,
      divorce_review: 400
    },
    keyProcesses: {
      mip: "Mandatory Information Program (MIP) must be attended.",
      caseConference: "Case conference is the first court appearance.",
      settlementConference: "Settlement conference attempts resolution before trial.",
      form8: "Form 8 (Application) is the starting document."
    },
    forms: {
      application: "Form 8 - Application",
      financialStatement: "Form 13 - Financial Statement",
      answer: "Form 10 - Answer",
      affidavitOfService: "Form 6B - Affidavit of Service"
    },
    resources: {
      website: "https://ontariocourts.ca",
      steps: "https://stepstojustice.ca/legal-topic/family-law"
    }
  },
  
  bc: {
    name: "British Columbia",
    court: "Provincial Court / Supreme Court",
    legislation: [
      "Family Law Act",
      "Divorce Act (Federal)"
    ],
    filingFees: {
      provincial: 0,
      supreme: 200
    },
    keyProcesses: {
      parentingEducation: "Parenting After Separation course required.",
      fmc: "Family Management Conference used in Supreme Court.",
      provincialVsSupreme: "Provincial Court handles parenting/support. Supreme Court needed for divorce/property."
    },
    forms: {
      application: "Application About a Family Law Matter",
      financialStatement: "Financial Statement (Form F8)",
      guardianship: "Application for Guardianship"
    },
    resources: {
      website: "https://www.bccourts.ca",
      familyLaw: "https://family.legalaid.bc.ca"
    }
  },
  
  manitoba: {
    name: "Manitoba",
    court: "Court of King's Bench",
    legislation: [
      "Family Maintenance Act",
      "Divorce Act (Federal)"
    ],
    filingFees: {
      petition: 200
    },
    keyProcesses: {
      parentingProgram: "For the Sake of the Children program may be required.",
      caseConference: "Case conferences used to manage proceedings."
    },
    resources: {
      website: "https://www.manitobacourts.mb.ca"
    }
  }
};

// ============================================
// SYSTEM PROMPTS
// ============================================

const createSystemPrompt = (jurisdiction, userContext = {}) => {
  const jur = JURISDICTION_KNOWLEDGE[jurisdiction] || JURISDICTION_KNOWLEDGE.saskatchewan;
  
  return `You are Foresight AI, a helpful assistant for self-represented parents navigating family court custody proceedings in ${jur.name}, Canada.

## Your Role
You provide LEGAL INFORMATION (not legal advice) to help parents understand custody processes, court procedures, required forms, and their options. You empower parents with knowledge while being clear about the limits of AI assistance.

## Jurisdiction: ${jur.name}
- **Court:** ${jur.court}
- **Key Legislation:** ${jur.legislation.join(', ')}
- **Filing Fees:** ${JSON.stringify(jur.filingFees)}

## Key Processes in ${jur.name}
${Object.entries(jur.keyProcesses || {}).map(([key, value]) => `- **${key.toUpperCase()}:** ${value}`).join('\n')}

## Important Forms
${Object.entries(jur.forms || {}).map(([key, value]) => `- ${value}`).join('\n')}

## Guidelines

### DO:
- Explain court processes clearly and step-by-step
- Describe what forms are needed and when
- Clarify legal terminology in plain language
- Provide general information about timelines and procedures
- Encourage proper preparation and documentation
- Suggest when professional legal help may be beneficial
- Be empathetic - custody battles are emotionally difficult
- Reference specific ${jur.name} procedures and forms

### DON'T:
- Give specific legal advice for their situation
- Tell them what decision to make
- Predict court outcomes
- Provide information that could be used to manipulate the system
- Dismiss the complexity of their situation
- Encourage adversarial behavior
- Make promises about results

### TONE:
- Warm, supportive, and non-judgmental
- Clear and concise
- Professional but accessible
- Empowering, not patronizing

### FORMAT:
- Use clear headings for multi-part answers
- Include specific form names/numbers when relevant
- Provide step-by-step instructions where appropriate
- Keep responses focused and actionable

## Important Disclaimers
Always remember to clarify when appropriate:
- "This is general legal information, not legal advice"
- "Every situation is unique - consider consulting a lawyer for your specific circumstances"
- "Court procedures can change - verify current requirements with the court"

${userContext.caseDetails ? `\n## User Context\n${userContext.caseDetails}` : ''}

Remember: Your goal is to help self-represented parents feel more confident and prepared, while being honest about what you can and cannot help with.`;
};

// ============================================
// RESPONSE TEMPLATES
// ============================================

const COMMON_RESPONSES = {
  howToStart: (jur) => `
## How to Start a Custody Case in ${jur.name}

Here's a step-by-step overview:

### Step 1: Pre-Filing Requirements
${jur.keyProcesses?.fdr ? `- **FDR/Mediation:** ${jur.keyProcesses.fdr}` : ''}
${jur.keyProcesses?.parentingCourse || jur.keyProcesses?.pas ? `- **Parenting Course:** Complete the mandatory parenting education program` : ''}

### Step 2: Prepare Your Documents
- Gather all relevant documents (financial records, communication logs, etc.)
- Complete the initial application/petition form
- Prepare your financial statement if requesting support

### Step 3: File with the Court
- File at your local ${jur.court}
- Pay the filing fee ($${jur.filingFees?.contested || jur.filingFees?.other || 200} for contested matters)
- Obtain file-stamped copies

### Step 4: Serve the Other Party
- The respondent must be personally served
- Use a process server or any adult who isn't a party to the case
- File proof of service with the court

### Step 5: Wait for Response
- The other party typically has 30 days to respond
- If no response, you may be able to proceed by default

**Next Steps:** Would you like details on any specific step?
`,

  formsNeeded: (jur) => `
## Required Forms in ${jur.name}

The forms you need depend on your situation, but here are the most common:

### Starting Your Case
${Object.entries(jur.forms || {}).map(([key, form]) => `- **${form}**`).join('\n')}

### Where to Get Forms
- Court website: ${jur.resources?.website || 'Contact your local courthouse'}
- Court registry in person
- Some forms available at Foresight (coming soon)

### Tips for Completing Forms
1. Read all instructions carefully
2. Use black ink if handwriting
3. Be accurate - you're signing under oath
4. Keep copies of everything
5. Don't leave blanks - write "N/A" if not applicable

Would you like help with a specific form?
`,

  financialStatement: (jur) => `
## Financial Statement Guide

The Financial Statement is one of the most important documents in family court. Here's what you need to know:

### When It's Required
- Any application involving child support
- Any application involving spousal support
- Property division matters

### What to Include
1. **Income** - All sources (employment, benefits, investments, etc.)
2. **Expenses** - Monthly household and personal expenses
3. **Assets** - Property, vehicles, savings, investments, pensions
4. **Debts** - Mortgages, loans, credit cards

### Documents to Attach
- Recent pay stubs (usually last 3)
- Last 3 years of tax returns and NOAs
- Bank statements
- Investment statements

### Common Mistakes to Avoid
- Underreporting income (courts can impute income)
- Forgetting irregular income (bonuses, overtime)
- Not updating when circumstances change
- Missing the disclosure deadline

### Important
Your financial statement is sworn - inaccuracies can damage your credibility and may constitute contempt of court.

Need help with a specific section?
`
};

// ============================================
// MAIN AI SERVICE CLASS
// ============================================

class ForesightAI {
  constructor(apiKey = null) {
    this.apiKey = apiKey || getApiKey();
    this.model = 'claude-sonnet-4-20250514';
    this.maxTokens = 1024;
  }

  /**
   * Send a message to Claude and get a response
   */
  async chat(message, options = {}) {
    const {
      jurisdiction = 'saskatchewan',
      conversationHistory = [],
      userContext = {},
      stream = false
    } = options;

    if (!this.apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const systemPrompt = createSystemPrompt(jurisdiction, userContext);
    
    // Build messages array
    const messages = [
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    try {
      const response = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: this.maxTokens,
          system: systemPrompt,
          messages: messages,
          stream: stream
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'AI request failed');
      }

      if (stream) {
        return response.body;
      }

      const data = await response.json();
      
      return {
        content: data.content[0].text,
        tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens,
        model: data.model,
        stopReason: data.stop_reason
      };
    } catch (error) {
      console.error('AI chat error:', error);
      throw error;
    }
  }

  /**
   * Analyze a document and provide insights
   */
  async analyzeDocument(documentText, options = {}) {
    const {
      jurisdiction = 'saskatchewan',
      documentType = 'unknown'
    } = options;

    const prompt = `Please analyze this ${documentType} document for a self-represented parent in ${jurisdiction}. 

Provide:
1. **Document Type:** Confirm what type of document this appears to be
2. **Key Information:** Extract important dates, names, and facts
3. **Completeness Check:** Note any missing required information
4. **Suggestions:** Provide 3-5 specific suggestions to improve or complete the document
5. **Red Flags:** Note any concerning language or potential issues

Document text:
---
${documentText}
---

Format your response as clear, actionable bullet points.`;

    return this.chat(prompt, { jurisdiction });
  }

  /**
   * Generate deadline reminders based on case timeline
   */
  async generateDeadlines(caseInfo, options = {}) {
    const {
      jurisdiction = 'saskatchewan'
    } = options;

    const prompt = `Based on the following case information, generate a list of likely upcoming deadlines and important dates. Include standard procedural deadlines for ${jurisdiction}.

Case Information:
- Filing Date: ${caseInfo.filingDate || 'Not specified'}
- Case Type: ${caseInfo.caseType || 'custody/parenting'}
- Current Stage: ${caseInfo.currentStage || 'initial filing'}
- Hearing Date: ${caseInfo.hearingDate || 'Not scheduled'}

Please provide:
1. A list of deadlines in chronological order
2. The source/reason for each deadline (e.g., "30 days from service per court rules")
3. Priority level (high/medium/low)
4. Suggested preparation tasks for each

Format as a structured list.`;

    return this.chat(prompt, { jurisdiction });
  }

  /**
   * Explain a legal term or concept
   */
  async explainTerm(term, options = {}) {
    const {
      jurisdiction = 'saskatchewan'
    } = options;

    const prompt = `Please explain the term "${term}" as it applies to family law custody cases in ${jurisdiction}.

Include:
1. Simple definition in plain language
2. Why it matters in custody cases
3. How it might apply to a self-represented parent
4. Related terms they should know

Keep the explanation accessible for someone without legal training.`;

    return this.chat(prompt, { jurisdiction });
  }

  /**
   * Review a draft document
   */
  async reviewDraft(documentText, documentType, options = {}) {
    const {
      jurisdiction = 'saskatchewan'
    } = options;

    const prompt = `Please review this draft ${documentType} for a ${jurisdiction} family court case.

Provide feedback on:
1. **Completeness:** Is all required information included?
2. **Clarity:** Is the language clear and understandable?
3. **Tone:** Is the tone appropriate for court?
4. **Facts vs. Opinions:** Are statements factual and supported?
5. **Formatting:** Does it follow court formatting requirements?
6. **Specific Improvements:** Suggest 3-5 concrete changes

Draft document:
---
${documentText}
---

Be constructive and specific in your feedback.`;

    return this.chat(prompt, { jurisdiction });
  }

  /**
   * Generate questions to ask at a hearing
   */
  async generateHearingQuestions(context, options = {}) {
    const {
      jurisdiction = 'saskatchewan',
      hearingType = 'case conference'
    } = options;

    const prompt = `Help prepare questions for a ${hearingType} in ${jurisdiction} family court.

Context:
${context}

Please provide:
1. 5-7 questions to ask the other party (if applicable)
2. Questions to ask the judge/court for clarification
3. Questions to prepare answers for
4. Topics to raise proactively
5. Things to avoid saying

Remember: The goal is to be prepared, professional, and focused on the children's best interests.`;

    return this.chat(prompt, { jurisdiction });
  }

  /**
   * Quick answer for common questions (uses templates when possible)
   */
  quickAnswer(questionType, jurisdiction = 'saskatchewan') {
    const jur = JURISDICTION_KNOWLEDGE[jurisdiction] || JURISDICTION_KNOWLEDGE.saskatchewan;
    
    const templates = {
      'how-to-start': COMMON_RESPONSES.howToStart(jur),
      'forms-needed': COMMON_RESPONSES.formsNeeded(jur),
      'financial-statement': COMMON_RESPONSES.financialStatement(jur)
    };

    return templates[questionType] || null;
  }

  /**
   * Get jurisdiction info
   */
  getJurisdictionInfo(jurisdiction) {
    return JURISDICTION_KNOWLEDGE[jurisdiction] || null;
  }
}

// ============================================
// REACT HOOK FOR AI CHAT
// ============================================

/**
 * React hook for using ForesightAI in components
 * 
 * Usage:
 * const { sendMessage, messages, loading, error } = useForesightAI('saskatchewan');
 */
export function useForesightAI(jurisdiction = 'saskatchewan') {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const ai = new ForesightAI();

  const sendMessage = async (content) => {
    setLoading(true);
    setError(null);
    
    // Add user message
    const userMessage = { role: 'user', content, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Check for quick answer first
      const quickTypes = {
        'how do i start': 'how-to-start',
        'what forms': 'forms-needed',
        'financial statement': 'financial-statement'
      };
      
      const lowerContent = content.toLowerCase();
      let response;
      
      for (const [trigger, type] of Object.entries(quickTypes)) {
        if (lowerContent.includes(trigger)) {
          const quickResponse = ai.quickAnswer(type, jurisdiction);
          if (quickResponse) {
            response = { content: quickResponse, tokensUsed: 0 };
            break;
          }
        }
      }

      // If no quick answer, call AI
      if (!response) {
        response = await ai.chat(content, {
          jurisdiction,
          conversationHistory: messages
        });
      }

      // Add AI response
      const aiMessage = { 
        role: 'assistant', 
        content: response.content,
        tokensUsed: response.tokensUsed,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);

      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearMessages,
    ai // Expose AI instance for advanced usage
  };
}

// ============================================
// SERVER-SIDE API ROUTE (Next.js)
// ============================================

/**
 * Example Next.js API route for proxying AI requests
 * Place in: pages/api/ai/chat.js or app/api/ai/chat/route.js
 */
export const apiRouteHandler = `
// pages/api/ai/chat.js
import { ForesightAI } from '@/lib/ai-service';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify user is authenticated
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check rate limits / tier
  const user = await getUserWithTier(session.user.id);
  if (user.daily_queries_used >= getTierLimit(user.tier)) {
    return res.status(429).json({ error: 'Daily query limit reached' });
  }

  const { message, jurisdiction, conversationHistory } = req.body;

  try {
    const ai = new ForesightAI(process.env.ANTHROPIC_API_KEY);
    const response = await ai.chat(message, {
      jurisdiction,
      conversationHistory
    });

    // Increment query count
    await incrementQueryCount(session.user.id);

    res.status(200).json(response);
  } catch (error) {
    console.error('AI error:', error);
    res.status(500).json({ error: 'AI request failed' });
  }
}
`;

// ============================================
// EXPORTS
// ============================================

export { ForesightAI, JURISDICTION_KNOWLEDGE, createSystemPrompt };
export default ForesightAI;
