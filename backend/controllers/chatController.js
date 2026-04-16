const { GoogleGenerativeAI } = require("@google/generative-ai");

const chatController = {
  sendMessage: async (req, res) => {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.trim() === "") {
        return res.status(200).json({ 
          reply: "Namaste kisan bhai! 🙏\nAbhi mere system mein 'Google Gemini API Key' set nahi hui hai." 
        });
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

      const prompt = `You are a helpful and intelligent AI assistant for the "Digital Gaon" portal. 
      While your primary audience includes people in rural areas, farmers, and students, you are an "all-rounder" AI.
      You must answer questions on ANY topic, including agriculture, education, technology, general knowledge, science, health, or anything else the user asks.
      You can understand and respond in Hindi (written in Devanagari or English script) or English.
      Keep your answers informative, respectful, easy to understand, and provide proper details just like ChatGPT.
      
      User's message: ${message}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      res.status(200).json({ reply: text });
    } catch (error) {
      console.error("Chatbot Error fallback triggered:", error.message);
      // Fallback AI Engine (Rule-based) if API fails
      const msg = req.body.message.toLowerCase();
      let reply = "";

      if (msg.includes("mausam") || msg.includes("weather") || msg.includes("barish") || msg.includes("मौसम")) {
        reply += "🌦️ **आज का मौसम:** आज मौसम खुला रहेगा और आसमान साफ रहने की उम्मीद है। अभी बारिश के कोई आसार नहीं हैं, इसलिए आप खेतों में कीटनाशक (Pesticides) का छिड़काव आसानी से कर सकते हैं।";
      } else if (msg.includes("fasal") || msg.includes("crop") || msg.includes("gehu") || msg.includes("बीज") || msg.includes("फसल")) {
        reply += "🌾 **फसल की जानकारी:** इस मौसम में रबी की फसल (जैसे गेहूं, चना, सरसों) की बुवाई के लिए समय बिल्कुल सही है। अच्छी पैदावार के लिए उन्नत किस्म के बीजों का चयन करें और खेत में पोटाश की मात्रा का ध्यान रखें।";
      } else if (msg.includes("yojana") || msg.includes("scheme") || msg.includes("pm kisan") || msg.includes("योजना")) {
        reply += "📄 **सरकारी योजना:** 'पीएम किसान सम्मान निधि' की अगली किस्त जल्द ही आने वाली है। अगर आपने अभी तक अपनी e-KYC पूरी नहीं की है, तो कृपया नज़दीकी सीएससी (CSC) सेंटर जाकर करवा लें।";
      } else if (msg.includes("hello") || msg.includes("hi") || msg.includes("namaste") || msg.includes("नमस्ते")) {
        reply += "आपको खेती-बाड़ी, मौसम, फसल या किसी सरकारी योजना के बारे में क्या जानना है? आप बेझिझक पूछ सकते हैं! 😊";
      } else {
        reply += "अभी मैं आपकी यह बात पूरी तरह नहीं समझ पा रहा हूँ, लेकिन अगर आपका सवाल मौसम या फसल के बारे में है, तो कृपया थोड़ा और विस्तार से बताएँ। मैं आपकी पूरी मदद करूँगा!";
      }

      res.status(200).json({ reply });
    }
  }
};

module.exports = chatController;
