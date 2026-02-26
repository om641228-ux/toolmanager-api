const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { image } = req.body;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const prompt = `Ты эксперт-инструментальщик. Опиши инструмент на фото. 
    Выдай строго одну строку в формате: Название | Бренд | Состояние. 
    Пример: Молоток | Stanley | Хорошее`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: image.split(',')[1], mimeType: "image/jpeg" } }
    ]);

    res.status(200).json({ success: true, text: result.response.text().trim() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};