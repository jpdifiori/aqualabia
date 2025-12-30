const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, ".env.local") });

async function testGemini() {
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
        console.error("❌ Error: GOOGLE_API_KEY no encontrada en .env.local");
        return;
    }

    console.log("🚀 Probando conexión con Gemini API...");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        const prompt = "Hola Gemini, estoy probando la API para mi app PoolPal AI. ¿Puedes confirmar que recibes este mensaje y responder brevemente?";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("\n✅ Respuesta de Gemini:");
        console.log("-----------------------");
        console.log(text);
        console.log("-----------------------");
        console.log("\n✨ ¡La API está funcionando correctamente!");
    } catch (error) {
        console.error("\n❌ Error al llamar a la API:");
        console.error(error.message);
    }
}

testGemini();
