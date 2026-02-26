const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ success: false, error: "Нет фото" });

    const genAI = new GoogleGenerativeAI("AIzaSyCQIpoC8NnyOjMvM3kUSUhcHdPG5BLYA5g");
    
    // Используем мощную модель 2.5 Pro для детальной таблицы
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const base64Data = image.split(',')[1];
    const imagePart = {
      inlineData: { data: base64Data, mimeType: "image/jpeg" }
    };

    // ВАЖНО: Даем ИИ инструкцию использовать разделитель "|"
    const prompt = `Распознай все инструменты на фото. 
    Для каждого инструмента напиши ответ строго в формате:
    Название | Характерные черты
    Пример:
    Молоток | Деревянная ручка, стальной боек
    Тиски | Слесарные, синего цвета
    Пиши каждый инструмент с новой строки. Без цифр и лишнего текста.`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text().trim();

    return res.status(200).json({ 
      success: true, 
      name: text 
    });

  } catch (err) {
    return res.status(500).json({ success: false, name: "Ошибка: " + err.message });
  }
};