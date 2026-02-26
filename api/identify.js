const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  // Настройка заголовков для безопасной связи с Netlify
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ success: false, error: "Нет изображения" });

    // БЕЗОПАСНОСТЬ: Берем новый ключ из секретов Vercel
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        success: false, 
        name: "СЕРВЕР | Ошибка: Ключ GEMINI_API_KEY не настроен в Vercel" 
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // ИСПОЛЬЗУЕМ САМУЮ МОЩНУЮ МОДЕЛЬ ИЗ СПИСКА
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    // Подготовка картинки
    const base64Data = image.split(',')[1];
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: "image/jpeg"
      }
    };

    // СПЕЦИАЛЬНЫЙ ПРОМПТ ДЛЯ МОДЕЛИ 2.5 PRO
    const prompt = `Ты эксперт по строительным инструментам. Тщательно изучи фото.
    Найди ВСЕ инструменты и для каждого создай СТРОГО одну строку в формате:
    Название инструмента | Характерные черты (бренд, цвет, состояние)
    
    Пример ответа:
    Молоток Stanley | Черная прорезиненная ручка, новый
    Ключ рожковый 17мм | Стальной, есть следы ржавчины
    
    Пиши ТОЛЬКО список через разделитель "|". Не используй цифры, точки или лишние слова.`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    
    // Очищаем ответ от возможных артефактов Markdown (например, **)
    const cleanText = response.text().replace(/\*/g, '').trim();

    return res.status(200).json({ 
      success: true, 
      name: cleanText 
    });

  } catch (err) {
    console.error("Критическая ошибка:", err);
    return res.status(500).json({ 
      success: false, 
      name: "Ошибка 2.5 Pro | " + err.message 
    });
  }
};