import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

const MODEL_NAME = "gemini-2.0-flash";

/**
 * Analyzes a pool image to determine water quality.
 */
export const analyzeWaterQuality = async (base64Image: string, lang: string = 'en') => {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const promptES = `
    Analiza esta imagen de una piscina y determina la calidad del agua.
    Busca signos de turbidez, algas o suciedad.
    Proporciona una respuesta en formato JSON con la siguiente estructura:
    {
      "clarity": "clear" | "cloudy" | "algae" | "very_dirty",
      "diagnosis": "Breve descripción del estado del agua",
      "confidence": number (0-1),
      "suggestion": "Acción inmediata recomendada"
    }
    Se muy preciso y honesto sobre tu confianza.
    IMPORTANTE: La respuesta de "diagnosis" y "suggestion" DEBE ser en ESPAÑOL.
  `;

  const promptEN = `
    Analyze this pool image and determine water quality.
    Look for signs of turbidity, algae, or dirt.
    Provide a JSON response with this structure:
    {
      "clarity": "clear" | "cloudy" | "algae" | "very_dirty",
      "diagnosis": "Short description of the water state",
      "confidence": number (0-1),
      "suggestion": "Immediate recommended action"
    }
    Be very precise and honest about your confidence.
    IMPORTANT: The "diagnosis" and "suggestion" fields MUST be in ENGLISH.
  `;

  const prompt = lang === 'es' ? promptES : promptEN;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: base64Image,
        mimeType: "image/jpeg",
      },
    },
  ]);

  const response = result.response;
  const text = response.text().replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return null;
  }
};

/**
 * Analyzes a pool test strip to identify chemical levels.
 */
export const analyzeTestStrip = async (base64Image: string, lang: string = 'es') => {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const prompt = `
    Analyze this pool test strip.
    Identify the values of these parameters based on the color pads:
    - pH
    - Free Chlorine
    - Total Alkalinity
    - Calcium Hardness (if present)
    - Cyanuric Acid (CYA) (if present)

    Respond in JSON format with estimated numerical values:
    {
      "ph": number,
      "free_chlorine": number,
      "alkalinity": number,
      "hardness": number | null,
      "cya": number | null,
      "confidence": number (0-1)
    }
    Output only the JSON.
    Language preference for internal processing: ${lang === 'es' ? 'Spanish' : 'English'}.
  `;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: base64Image,
        mimeType: "image/jpeg",
      },
    },
  ]);

  const response = result.response;
  const text = response.text().replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return null;
  }
};

/**
 * Generates a treatment plan based on pool data and measurements.
 */
export const generateTreatmentPlan = async (poolData: any, measurements: any, lang: string = 'es') => {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const prompt = `
    Act as a professional pool maintenance specialist for home pools.
    ${lang === 'es' ? 'Tu tono debe ser profesional y práctico.' : 'Your tone should be professional and practical.'}

    Pool Info: ${poolData.name}, ${poolData.volume}L, material ${poolData.material}, shape ${poolData.shape}.
    Current Measurements: pH ${measurements.ph}, Chlorine ${measurements.free_chlorine}ppm, Alkalinity ${measurements.alkalinity}ppm, Clarity: ${measurements.clarity || 'Unknown'}.

    Objective: Generate a clear, simple, and actionable maintenance plan.
    Constraints:
    - Max 1-2 tasks per day.
    - pH testing max 1-2 times per week.
    - Simple and repeatable routines.
    - Avoid unnecessary technical jargon.

    JSON STRUCTURE (MANDATORY):
    {
      "status_summary": "Initial diagnosis and urgency level.",
      "priority": "high" | "medium" | "low",
      "immediate_steps": [
        {
          "action": "Recovery task",
          "product": "Product name",
          "amount": "Estimated amount",
          "instructions": "Brief explanation"
        }
      ],
      "maintenance_plan_daily": [
        {
          "day_index": number (0 to 29),
          "tasks": [
            {
              "action": "Task name (max 2 per day)",
              "note": "Brief practical note"
            }
          ]
        }
      ],
      "warnings": ["Safety rules and red flags"],
      "final_summary": "Expected outcome and message of reassurance."
    }

    IMPORTANT: All text in the JSON fields MUST be in ${lang === 'es' ? 'SPANISH' : 'ENGLISH'}.
    `;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text().replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse treatment plan JSON", e);
    return { error: "No se pudo generar el plan", raw: text };
  }
};
