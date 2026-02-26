const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  // Настройка CORS для стабильной связи Netlify + Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ success: false, error: "Фото не получено" });

    // 1. Твой подтвержденный рабочий ключ (вставлен без лишних пробелов)
    const genAI = new GoogleGenerativeAI("AIzaSyB0hM1pZaAJ_xj7Q0TDbRIzmMIMD7VwvM4");
    
    // 2. ВЫБРАННАЯ МОДЕЛЬ: Самая мощная из твоего списка
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const base64Data = image.split(',')[1];
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: "image/jpeg"
      }
    };

    // 3. Улучшенный промпт для точности
    const prompt = "Что это за инструмент на фото? Назови только его технически правильное название на русском языке (например: Тиски слесарные, Клещи переставные, Пассатижи).";

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text().trim();

    // Возвращаем результат в интерфейс
    return res.status(200).json({ 
      success: true, 
      name: text 
    });

  } catch (err) {
    console.error("Ошибка API:", err);
    return res.status(500).json({ 
      success: false, 
      name: "Ошибка модели 2.5: " + err.message 
    });
  }
};