const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  // Настройки CORS для связи с Netlify
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ success: false, error: "Фото не получено" });

    // БЕРЕМ КЛЮЧ ИЗ НАСТРОЕК VERCEL (СИСТЕМА БОЛЬШЕ ЕГО НЕ ЗАБЛОКИРУЕТ)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        success: false, 
        name: "Ошибка: Ключ GEMINI_API_KEY не найден в Environment Variables на Vercel" 
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // ИСПОЛЬЗУЕМ САМУЮ ПРОДВИНУТУЮ МОДЕЛЬ ИЗ ТВОЕГО СПИСКА
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    // Подготовка изображения
    const base64Data = image.split(',')[1];
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: "image/jpeg"
      }
    };

    // Промпт для детального табличного вывода
    const prompt = `Ты — эксперт по инструментам. Распознай ВСЕ объекты на фото.
    Для каждого инструмента создай строго одну строку в формате:
    Название инструмента | Характерные черты (цвет, состояние, детали)
    
    Пример ответа:
    Бокорезы | Красные ручки, есть следы износа
    Ключ разводной | Стальной, марка MATRIX
    
    Пиши только список, без вводных слов.`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text().trim();

    return res.status(200).json({ 
      success: true, 
      name: text 
    });

  } catch (err) {
    console.error("Ошибка сервера:", err);
    return res.status(500).json({ 
      success: false, 
      name: "Ошибка модели 2.5 Pro: " + err.message 
    });
  }
};