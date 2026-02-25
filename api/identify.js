const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  // CORS настройки...
  
  try {
    const { image } = req.body;
    
    // 1. Твой новый подтвержденный ключ
    const genAI = new GoogleGenerativeAI("AIzaSyDQb4WD2NZebkuGpejZioYPN64g0TdCcQQ");
    
    // 2. САМАЯ ЛУЧШАЯ МОДЕЛЬ из твоего списка
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const base64Data = image.split(',')[1];
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: "image/jpeg"
      }
    };

    const prompt = "Ты эксперт по строительным инструментам. Назови только конкретное название инструмента на этом фото на русском языке. Будь предельно точен.";

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    
    return res.status(200).json({ 
      success: true, 
      name: response.text().trim() 
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};