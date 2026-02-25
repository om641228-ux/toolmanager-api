const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  // Настройка CORS для Netlify
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ success: false, error: "Нет изображения" });

    // 1. Подключаем мощную модель Flash 2.0 (версия 002)
    // Вставь свой ключ из Google AI Studio вместо 'YOUR_API_KEY'
    const genAI = new GoogleGenerativeAI("AIzaSyCbG21epZgL9I2GMrY7uXKVQ4D6ZT8-P6E");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });

    // 2. Обработка Base64
    const base64Data = image.split(',')[1];
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: "image/jpeg"
      }
    };

    // 3. Промпт для максимальной точности
    const prompt = "Ты профессиональный мастер. Что за строительный инструмент на этом фото? Назови только его название на русском языке. Будь краток.";

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const toolName = response.text().trim();

    return res.status(200).json({ 
      success: true, 
      name: toolName 
    });
  } catch (err) {
    console.error("Gemini Error:", err);
    return res.status(500).json({ success: false, error: "Ошибка ИИ: " + err.message });
  }
};