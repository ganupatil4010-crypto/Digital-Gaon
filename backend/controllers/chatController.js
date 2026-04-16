const { GoogleGenerativeAI } = require("@google/generative-ai");

const chatController = {
  sendMessage: async (req, res) => {
    try {
      const { message, image } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.trim() === "") {
        return res.status(200).json({ 
          reply: "Namaste kisan bhai! 🙏\nAbhi mere system mein 'Google Gemini API Key' set nahi hui hai." 
        });
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      
      // Senior-Level Robust Model Strategy
      const modelsToTry = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-pro", "gemini-flash-latest"];
      let lastError = null;
      let aiText = "";

      const basePrompt = `CRITICAL OPERATIONAL MODE: YOU ARE AN ALL-ROUNDER AI. 
      Website: Digital Gaon. 
      Primary Audience: Rural citizens & Students.
      
      INSTRUCTION FOR CLEAN ANSWERS (ChatGPT Style):
      1. Use Markdown for ALL responses. 
      2. Use '###' for section headings.
      3. Use '*' or '1.' for lists/bullet points.
      4. Use **bold** for key terms.
      5. Organize information into logical sections.
      
      Rules:
      - Answer ANY question on ANY topic (Math, Science, History, 10th-grade, Technology, etc.). 
      - Do NOT restrict yourself to agriculture. 
      - Use Hindi (Devanagari) or English as requested.
      
      User's message: ${message}`;

      let promptContent = [basePrompt];

      if (image && image.data && image.mimeType) {
        promptContent.push({
          inlineData: {
            data: image.data,
            mimeType: image.mimeType
          }
        });
      }

      // Robust Retry & Fallback Loop
      for (const modelName of modelsToTry) {
        try {
          console.log(`--- ATTEMPTING AI CALL WITH MODEL: ${modelName} ---`);
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(promptContent);
          const response = await result.response;
          aiText = response.text().trim();
          
          if (aiText) {
            console.log(`--- SUCCESS WITH MODEL: ${modelName} ---`);
            break; // Exit loop on success
          }
        } catch (error) {
          lastError = error;
          console.error(`--- MODEL ${modelName} FAILED ---`);
          console.error(`Error: ${error.message}`);
          
          // If it's a 503 (Overloaded), wait 1s before trying next model
          if (error.message.includes("503") || error.message.includes("overloaded")) {
            console.log("Model busy, waiting 1s...");
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          continue; // Try next model in list
        }
      }

      if (aiText) {
        return res.status(200).json({ reply: aiText });
      }

      // If all models fail, trigger the general fallback
      throw lastError || new Error("All AI models failed");

    } catch (error) {
      console.error("--- ALL AI MODELS FAILED ---");
      console.error("Message:", error.message);
      
      // Improved All-Rounder Fallback
      const msg = (req.body.message || "").toLowerCase();
      let reply = "";

      if (msg.includes("mausam") || msg.includes("weather") || msg.includes("मौसम")) {
        reply = "🌦️ **Mausam Update:** Aaj mausam saaf rehne ki umeed hai. Kheti ke kaamo ke liye ye samay accha hai.";
      } else if (msg.includes("fasal") || msg.includes("crop") || msg.includes("phasal")) {
        reply = "🌾 **Kheti Ki Jankari:** Is mausam mein Rabi ki fasal ki taiyari shuru karna sahi rahega.";
      } else if (msg.includes("hello") || msg.includes("hi") || msg.includes("namaste")) {
        reply = "Namaste! Main Digital Gaon AI hoon. Main aapki education, technology, ya kheti se jude kisi bhi sawal ka jawab de sakta hoon. 😊";
      } else {
        // Professional General Fallback
        reply = "### Technical Issue\n\nMain maafi chahta hoon, par abhi mere system mein thodi technical problem aa rahi hai jiski wajah se main vistaar se jawab nahi de paa raha. 😅\n\nLekin main aapke sawal (jaise **10th class education** ya koi bhi topic) ka jawab dene mein puri tarah saksham hoon. Kripya thodi der baad phir se koshish karein ya Admin se API key check karne ko kahein.";
      }

      res.status(200).json({ reply });
    }
  }
};

module.exports = chatController;
