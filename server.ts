import express, { Request, Response } from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy Google GenAI Client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

const FALLBACK_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.6-flash', 'gemini-flash-latest'];

async function generateWithFallback(ai: GoogleGenAI, options: { contents: any; config?: any }) {
  let lastError: any = null;
  for (const model of FALLBACK_MODELS) {
    try {
      const res = await ai.models.generateContent({
        model,
        contents: options.contents,
        config: options.config,
      });
      return res;
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${model} unavailable (${err?.status || err?.message}), trying fallback...`);
    }
  }
  throw lastError;
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY';
  res.json({
    status: 'ok',
    geminiConfigured: hasKey,
    model: 'gemini-3.5-flash-lite',
  });
});

// Saathi AI Companion Chat Endpoint
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], context = {} } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message string is required' });
      return;
    }

    const ai = getGenAI();

    // Context metadata strings
    const userContextStr = `
Current User State:
- Reported Mood: ${context.mood || 'Unspecified'}
- Energy Level: ${context.energy || 'Unspecified'}
- Sleep Quality: ${context.sleep || 'Unspecified'}
- Case Stage: ${context.caseStage || 'Registration / Investigation'}
- Case Number: ${context.caseNumber || 'CR-2026/DEL-089'}
- Legal Aid: ${context.legalAid || 'DLSA Panel Advocate'}
- Helpline: MoSJE National Helpline Against Atrocities (NHAA) 14566
`.trim();

    // If Gemini API is not configured or fails, provide an intelligent fallback
    if (!ai) {
      console.warn('GEMINI_API_KEY is not configured or is placeholder. Using smart contextual assistant fallback.');
      const fallbackData = generateSmartFallback(message, context);
      res.json(fallbackData);
      return;
    }

    const systemInstruction = `
You are Saathi (साथी), an empathetic, trauma-informed psychological first-aid companion within the "Health Matrix" system for the Ministry of Social Justice and Empowerment (MoSJE), Government of India, and the 24/7 National Helpline Against Atrocities (NHAA 14566).

Your Core Mission:
1. Deep Empathetic Support: Validate the person's emotions with warmth, compassion, and non-judgmental dignity. Never dismiss feelings or offer toxic positivity.
2. Trauma-Informed Grounding: Offer soothing grounding techniques when distress or anxiety is detected (such as the app's 4-7-8 breathing circle, 5-4-3-2-1 sensory grounding, or physical body unclenching).
3. Legal Rights & Institutional Literacy: Confidently and accurately answer questions regarding:
   - The Scheduled Castes and the Scheduled Tribes (Prevention of Atrocities) Act, 1989 & Rules
   - Protection of Civil Rights (PCR) Act
   - Rights to free legal representation under DLSA (District Legal Services Authority)
   - Rights to in-camera court proceedings, victim witness protection, and mandatory periodic status updates
   - Immediate economic relief & rehabilitation compensation schemes provided under SC/ST PoA rules
4. Human Connection & Safety: Encourage calling the 24/7 toll-free helpline 14566 or requesting a callback from their designated counsellor (e.g., Dr. Ananya Sen) if they want human support.
5. Multilingual Fluency: Naturally respond in English, Hindi, or Hinglish depending on what language the user writes in.
6. Tone: Calm, reassuring, respectful, patient, and grounded.

Context for this user:
${userContextStr}

Format Requirement:
You MUST respond strictly with valid JSON conforming to the schema:
{
  "reply": "Warm, beautifully formatted response to the user. Use clear paragraphs or gentle bullet points if providing instructions or rights.",
  "quickReplies": ["3 to 4 short, relevant follow-up questions or actions the user might want to tap next"],
  "suggestedAction": "breathing" | "helpline" | "counsellor" | "none",
  "detectedDistress": "normal" | "moderate" | "crisis"
}
`.trim();

    // Format chat history for Gemini contents
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history)) {
      for (const h of history.slice(-8)) {
        if (h.text && (h.sender === 'user' || h.role === 'user')) {
          contents.push({ role: 'user', parts: [{ text: h.text }] });
        } else if (h.text && (h.sender === 'bot' || h.role === 'model')) {
          contents.push({ role: 'model', parts: [{ text: h.text }] });
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await generateWithFallback(ai, {
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: 'The empathetic, trauma-informed response to the user.',
            },
            quickReplies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 to 4 contextual follow-up reply options.',
            },
            suggestedAction: {
              type: Type.STRING,
              description: 'One of: breathing, helpline, counsellor, or none',
            },
            detectedDistress: {
              type: Type.STRING,
              description: 'One of: normal, moderate, or crisis',
            },
          },
          required: ['reply', 'quickReplies'],
        },
      },
    });

    const text = response.text?.trim() || '';
    let parsed: any;
    try {
      parsed = JSON.parse(text);
      if (parsed.suggestedAction) {
        const act = String(parsed.suggestedAction).toLowerCase();
        if (act.includes('breath')) parsed.suggestedAction = 'breathing';
        else if (act.includes('help') || act.includes('14566')) parsed.suggestedAction = 'helpline';
        else if (act.includes('counsel')) parsed.suggestedAction = 'counsellor';
        else parsed.suggestedAction = 'none';
      }
    } catch {
      parsed = {
        reply: text || 'Thank you for reaching out. I am right here with you. Take a gentle breath.',
        quickReplies: ['Breathing practice', 'Tell me my legal rights', 'Call NHAA 14566'],
        suggestedAction: 'none',
        detectedDistress: 'normal',
      };
    }

    res.json(parsed);
  } catch (error: any) {
    console.error('Gemini Chat error:', error);
    // Graceful fallback to avoid leaving user hanging
    const fallback = generateSmartFallback(req.body.message || '', req.body.context || {});
    res.json(fallback);
  }
});

// Counsellor AI Clinical Insights & Triage Copilot
app.post('/api/gemini/counsellor-insights', async (req: Request, res: Response) => {
  try {
    const { caseData, checkIns = [], existingNotes = [] } = req.body;

    if (!caseData) {
      res.status(400).json({ error: 'caseData is required' });
      return;
    }

    const ai = getGenAI();

    if (!ai) {
      res.json(generateCounsellorFallback(caseData));
      return;
    }

    const prompt = `
You are an expert Clinical Psychologist & Victim Support Specialist serving the Ministry of Social Justice and Empowerment (MoSJE) and District Legal Services Authority (DLSA).
Analyze this complainant's case dossier and check-in history to generate actionable, trauma-informed clinical recommendations for the supervising counsellor.

Patient / Case Dossier:
- Name: ${caseData.complainantName}
- Case Number: ${caseData.caseNumber}
- Current Stage: ${caseData.currentStage}
- Incident Type: ${caseData.incidentType}
- Distress Assessment: ${caseData.distressLevel}
- Contact Preference: ${caseData.contactPreference} (${caseData.preferredTime})
- Language: ${caseData.preferredLanguage}
- Investigating Officer: ${caseData.investigatingOfficer}
- Legal Aid Advocate: ${caseData.districtLegalAid}
- Next Hearing / Step: ${caseData.nextHearingDate}

Recent Check-in Logs:
${JSON.stringify(checkIns.slice(0, 5), null, 2)}

Prior Counsellor Notes:
${JSON.stringify(existingNotes.slice(0, 4), null, 2)}

Provide a clinical synthesis in JSON:
{
  "clinicalSummary": "Comprehensive 2-3 sentence overview of patient mental state, legal stress factors, and current trajectory.",
  "riskTrajectory": "improving" | "stable" | "elevated_anxiety" | "critical_intervention_needed",
  "psychosocialInterventions": ["3 specific clinical interventions (e.g., somatic grounding, safety planning, cognitive debriefing)"],
  "legalAidTalkingPoints": ["2 to 3 practical questions or advocate coordination points for DLSA"],
  "outreachAdvice": "Guidance on tone, pacing, and specific questions for the next counselling phone call."
}
`.trim();

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            clinicalSummary: { type: Type.STRING },
            riskTrajectory: { type: Type.STRING },
            psychosocialInterventions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            legalAidTalkingPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            outreachAdvice: { type: Type.STRING },
          },
          required: ['clinicalSummary', 'riskTrajectory', 'psychosocialInterventions', 'outreachAdvice'],
        },
      },
    });

    const text = response.text?.trim() || '{}';
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error('Counsellor Insights error:', error);
    res.json(generateCounsellorFallback(req.body.caseData));
  }
});

// Counsellor Clinical Note Refinement Assist
app.post('/api/gemini/assist-note', async (req: Request, res: Response) => {
  try {
    const { draft, complainantName, stage } = req.body;
    const ai = getGenAI();

    if (!ai || !draft) {
      res.json({
        enhancedNote: draft || 'Session conducted. Patient offered psychological first aid.',
      });
      return;
    }

    const prompt = `
Refine this counsellor's raw session notes into a professional, trauma-informed clinical intervention summary adhering to MoSJE & DLSA legal aid documentation standards.
Complainant Name: ${complainantName || 'Complainant'}
Case Stage: ${stage || 'Active'}
Raw Draft: "${draft}"

Output JSON:
{
  "enhancedNote": "Polished, structured clinical note with observations, interventions applied, and agreed follow-up."
}
`.trim();

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    res.json(JSON.parse(response.text?.trim() || '{"enhancedNote":""}'));
  } catch (err: any) {
    console.error('Assist note error:', err);
    res.json({ enhancedNote: req.body.draft });
  }
});

// Helper for high-quality fallback when API key is not present or rate limited
function generateSmartFallback(message: string, context: any) {
  const lower = message.toLowerCase();

  if (lower.includes('court') || lower.includes('hearing') || lower.includes('judge') || lower.includes('lawyer') || lower.includes('advocate') || lower.includes('dlsa')) {
    return {
      reply: `It is completely normal to feel apprehensive about court proceedings. Under the SC/ST (Prevention of Atrocities) Act and DLSA mandates:
• You are entitled to free, qualified legal representation via your assigned DLSA panel advocate (${context.legalAid || 'DLSA Panel'}).
• You have the right to in-camera proceedings to protect your privacy and dignity.
• Witness protection and travel allowance provisions are legally guaranteed.

Would you like us to review your upcoming hearing checklist or practice a calming 2-minute grounding exercise?`,
      quickReplies: ['Breathing practice', 'Victim rights details', 'Connect with counsellor', 'Remind me of next date'],
      suggestedAction: 'breathing',
      detectedDistress: 'moderate',
    };
  }

  if (lower.includes('breath') || lower.includes('panic') || lower.includes('anxious') || lower.includes('heart') || lower.includes('shaking') || lower.includes('dar')) {
    return {
      reply: `I hear how heavy this feels right now. Let's pause everything for just one minute together.
Take a gentle, slow breath in through your nose for 4 counts, hold gently for 7, and exhale all tension for 8.
Your safety and peace matter. The 4-7-8 breathing circle is ready right above whenever you want to begin.`,
      quickReplies: ['Start 4-7-8 breathing now', 'I feel a bit calmer', 'Call NHAA 14566'],
      suggestedAction: 'breathing',
      detectedDistress: 'moderate',
    };
  }

  if (lower.includes('14566') || lower.includes('helpline') || lower.includes('sos') || lower.includes('emergency') || lower.includes('call') || lower.includes('counsellor')) {
    return {
      reply: `You can reach the National Helpline Against Atrocities (NHAA) 24x7 at toll-free number 14566.
It is completely free, secure, and operated under the Ministry of Social Justice and Empowerment. Your designated counsellor Dr. Ananya Sen is also available for confidential telephone consultations.`,
      quickReplies: ['Call NHAA 14566 Now', 'Request Dr. Sen callback', 'I want to write more'],
      suggestedAction: 'helpline',
      detectedDistress: 'normal',
    };
  }

  if (lower.includes('sleep') || lower.includes('tired') || lower.includes('night') || lower.includes('insomnia') || lower.includes('so nahi')) {
    return {
      reply: `When the nervous system has experienced trauma or intense stress, restful sleep is often one of the first things affected.
Try to give yourself permission to simply rest your body without the pressure to fall asleep immediately. Lower the lights, relax your jaw, and let your shoulders drop away from your ears.`,
      quickReplies: ['Try breathing circle', 'Show sleep hygiene tips', 'Talk more'],
      suggestedAction: 'breathing',
      detectedDistress: 'normal',
    };
  }

  if (lower.includes('rights') || lower.includes('compensation') || lower.includes('fir') || lower.includes('sc/st') || lower.includes('atrocity')) {
    return {
      reply: `Under the SC/ST (PoA) Act, 1989 & PCR Act, you are entitled to comprehensive protection:
1. Immediate interim relief and financial compensation disbursed directly through the District Magistrate / Social Welfare department.
2. Free legal aid through the District Legal Services Authority (DLSA).
3. Protection from intimidation, with special investigation officers assigned to your matter.

Would you like to connect with your DLSA panel advocate or request a review of your compensation status?`,
      quickReplies: ['Check compensation status', 'Talk to DLSA advocate', 'Call 14566'],
      suggestedAction: 'counsellor',
      detectedDistress: 'normal',
    };
  }

  return {
    reply: `Thank you for sharing that with me. What you are going through is significant, and your courage in taking things step-by-step is deeply respected. I am here to support you in whatever way you need right now—whether you'd like to explore your feelings, learn about your legal rights, or simply take a quiet moment.`,
    quickReplies: [
      'Help me with court anxiety',
      'Start 4-7-8 breathing practice',
      'Explain my legal rights',
      'Connect with NHAA 14566',
    ],
    suggestedAction: 'none',
    detectedDistress: 'normal',
  };
}

function generateCounsellorFallback(caseData: any) {
  return {
    clinicalSummary: `${caseData.complainantName} is in the ${caseData.currentStage} stage with documented ${caseData.distressLevel} distress. Psychological stabilization and proactive DLSA legal coordination are recommended to mitigate anticipatory procedural trauma.`,
    riskTrajectory: caseData.distressLevel === 'High' ? 'elevated_anxiety' : 'stable',
    psychosocialInterventions: [
      'Conduct bi-weekly tele-counselling focusing on somatic regulation and sleep restoration.',
      'Establish personalized safety protocol and emergency contact hierarchy.',
      'Coordinate with DLSA panel advocate for pre-hearing orientation to demystify courtroom procedures.',
    ],
    legalAidTalkingPoints: [
      'Verify whether interim compensation disbursement has been processed with District Social Welfare.',
      'Confirm application for in-camera proceeding protections under SC/ST PoA guidelines.',
    ],
    outreachAdvice: `Use active trauma-informed listening. Complainant prefers ${caseData.contactPreference} during ${caseData.preferredTime} in ${caseData.preferredLanguage}.`,
  };
}

// Server Startup with Vite in Dev Mode & Static in Production Mode
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
