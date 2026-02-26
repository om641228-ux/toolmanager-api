const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ success: false, error: "Нет изображения" });

    // Твой проверенный ключ
    const genAI = new GoogleGenerativeAI("AIzaSyB0hM1pZaAJ_xj7Q0TDbRIzmMIMD7VwvM4");
    
    // Используем 2.5 Flash — она мощнее для поиска мелких деталей
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const base64Data = image.split(',')[1];
    const imagePart = {
      inlineData: { data: base64Data, mimeType: "image/jpeg" }
    };

    // НОВЫЙ ПРОМПТ ДЛЯ МНОЖЕСТВЕННОГО РАСПОЗНАВАНИЯ
    const prompt = `Проанализируй фото и перечисли все строительные инструменты, которые ты видишь. 
    Для каждого инструмента напиши:
    1. Название инструмента.
    2. Краткое описание (цвет или где находится на фото).
    Пиши строго списком, каждый инструмент с новой строки.`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text().trim();

    return res.status(200).json({ 
      success: true, 
      name: text // Весь список инструментов придет сюда
    });

  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      name: "Ошибка распознавания: " + err.message 
    });
  }
};