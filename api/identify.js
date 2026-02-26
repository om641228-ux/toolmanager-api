const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  // Настройка CORS для работы с Netlify
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ success: false, error: "Нет изображения" });

    // 1. Твой новый проверенный ключ
    const genAI = new GoogleGenerativeAI("AIzaSyDQb4WD2NZebkuGpejZioYPN64g0TdCcQQ");

    // 2. ИСПОЛЬЗУЕМ САМУЮ ЛУЧШУЮ МОДЕЛЬ ИЗ ТВОЕГО СПИСКА
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Подготовка картинки
    const base64Data = image.split(',')[1];
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: "image/jpeg"
      }
    };

    // 3. Четкая инструкция для ИИ
    const prompt = "Что это за инструмент на фото? Назови только его название на русском языке. Будь точен (например: Клещи строительные, Тиски слесарные, Пассатижи).";

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text().trim();

    return res.status(200).json({ 
      success: true, 
      name: text 
    });
  } catch (err) {
    console.error("Критическая ошибка:", err);
    // Выводим текст ошибки, чтобы видеть причину в браузере, если что-то не так
    return res.status(500).json({ 
      success: false, 
      error: "Ошибка Gemini 2.0: " + err.message 
    });
  }
};