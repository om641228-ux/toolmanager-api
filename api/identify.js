const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  // CORS для работы с Netlify
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ success: false, error: "Нет фото" });

    // Ключ берется из настроек Vercel (GEMINI_API_KEY)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("API Key не найден в Environment Variables");

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Используем самую продвинутую модель 2.5 Pro
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const base64Data = image.split(',')[1];
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: "image/jpeg"
      }
    };

    // Промпт, заточенный под Pro-модель и табличный вывод
    const prompt = `Ты эксперт-инструментальщик. Тщательно проанализируй фото.
    Найди ВСЕ инструменты и для каждого создай ОДНУ СТРОКУ в формате:
    Название инструмента | Характерные черты (бренд, цвет, состояние)
    
    Пример:
    Плоскогубцы KNIPEX | Сине-красные ручки, новые
    Отвертка шлицевая | Желтая ручка, намагниченное жало
    
    Пиши ТОЛЬКО этот список. Без цифр, без лишних слов. Каждая позиция с новой строки.`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text().trim();

    return res.status(200).json({ 
      success: true, 
      name: text 
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ 
      success: false, 
      name: "Ошибка 2.5 Pro: " + err.message 
    });
  }
};