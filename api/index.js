const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ База подключена'))
  .catch(err => console.error('❌ Ошибка базы:', err));

const Tool = mongoose.model('Tool', new mongoose.Schema({
  name: String,
  category: String,
  imageUrl: String,
  date: { type: Date, default: Date.now }
}));

// РОУТ АНАЛИЗА ФОТО (Распознавание)
app.post('/api/analyze', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: "Нет изображения" });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const base64Data = image.split(",")[1];

    const result = await model.generateContent([
      "Что за строительный инструмент на фото? Ответь только в формате JSON: {\"name\": \"название\", \"category\": \"категория\"}",
      { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
    ]);

    const text = result.response.text();
    const cleanJson = text.replace(/```json|```/g, "").trim();
    res.json(JSON.parse(cleanJson));
  } catch (error) {
    console.error("ИИ Ошибка:", error);
    res.status(500).json({ name: "Не определено", category: "инструмент" });
  }
});

// РОУТ СОХРАНЕНИЯ В БАЗУ
app.post('/api/save-tool', async (req, res) => {
  try {
    const newTool = new Tool(req.body);
    await newTool.save();
    res.json({ success: true, message: "Сохранено!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
