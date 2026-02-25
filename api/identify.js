const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ success: false, error: "Нет фото" });

    // 1. ИНИЦИАЛИЗАЦИЯ GEMINI
    // ЗАМЕНИ 'API_KEY' НА СВОЙ КЛЮЧ ИЗ AI STUDIO
    const genAI = new GoogleGenerativeAI("AIzaSyCbG21epZgL9I2GMrY7uXKVQ4D6ZT8-P6E"); 
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // 2. ПОДГОТОВКА КАРТИНКИ
    const base64Data = image.split(',')[1];
    const part = {
      inlineData: {
        data: base64Data,
        mimeType: "image/jpeg"
      }
    };

    // 3. РЕАЛЬНЫЙ ЗАПРОС К ИИ
    const prompt = "Что это за конкретный строительный инструмент на фото? Назови только модель или точное название на русском.";
    const result = await model.generateContent([prompt, part]);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ 
      success: true, 
      name: text.trim() 
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Gemini Error: " + err.message });
  }
};