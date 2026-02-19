const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

app.post('/api/analyze', async (req, res) => {
  try {
    const { image, language } = req.body; // Получаем язык от фронтенда
    const targetLang = language || 'русский'; // Если язык не пришел, ставим русский

    if (!genAI) throw new Error("API Key missing");

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const base64Data = image.split(",")[1];

    // Динамический промпт с учетом выбранного языка
    const prompt = `Идентифицируй инструмент на фото. 
      ОБЯЗАТЕЛЬНО ОТВЕТЬ НА ЯЗЫКЕ: ${targetLang}. 
      Формат ответа строго JSON: {"name": "название", "category": "категория"}`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
    ]);

    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();
    
    res.json(JSON.parse(text));
  } catch (error) {
    console.error("AI Error:", error.message);
    res.status(500).json({ name: "Ошибка", category: "Попробуйте снова" });
  }
});

app.post('/api/save-tool', (req, res) => {
  res.json({ success: true });
});

module.exports = app;