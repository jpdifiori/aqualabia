import { GoogleGenerativeAI } from "@google/generative-ai";

// In Expo, variables must start with EXPO_PUBLIC_ to be available in the client.
const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export const analyzeWaterQuality = async (base64Image: string, lang: string = 'en') => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

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
  return JSON.parse(text);
};

export const analyzeTestStrip = async (base64Image: string, lang: string = 'en') => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

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
  return JSON.parse(text);
};
