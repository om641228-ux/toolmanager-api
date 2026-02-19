const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

// Подключение к базе
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ DB Error:', err));

const ToolSchema = new mongoose.Schema({
  name: String,
  category: String,
  imageUrl: String,
  date: { type: Date, default: Date.now }
});
const Tool = mongoose.model('Tool', ToolSchema);

// Роут распознавания через Gemini
app.post('/api/analyze', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: "No image provided" });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const base64Data = image.split(",")[1];

    const result = await model.generateContent([
      "Идентифицируй строительный инструмент на фото. Ответь только валидным JSON: {\"name\": \"название\", \"category\": \"категория\"}",
      { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
    ]);

    const text = result.response.text().replace(/```json|```/g, "").trim();
    res.json(JSON.parse(text));
  } catch (error) {
    console.error(error);
    res.status(500).json({ name: "Не удалось распознать", category: "Инструмент" });
  }
});

// Роут сохранения
app.post('/api/save-tool', async (req, res) => {
  try {
    const tool = new Tool(req.body);
    await tool.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;