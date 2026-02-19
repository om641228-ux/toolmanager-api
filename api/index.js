const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// 1. ИСПРАВЛЯЕМ CORS (чтобы распознавание заработало)
app.use(cors({
  origin: '*', // Разрешаем любым доменам (включая твой Netlify) обращаться к API
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '10mb' })); // Увеличиваем лимит для приема фото

// 2. ПОДКЛЮЧЕНИЕ К БАЗЕ
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ База подключена'))
  .catch(err => console.error('❌ Ошибка базы:', err));

// Схема данных
const ToolSchema = new mongoose.Schema({
  name: String,
  category: String,
  date: { type: Date, default: Date.now }
});
const Tool = mongoose.model('Tool', ToolSchema);

// 3. РОУТ РАСПОЗНАВАНИЯ
app.post('/api/analyze', async (req, res) => {
  try {
    // Здесь должна быть твоя логика OpenAI/Gemini
    // Для теста возвращаем заглушку, которая точно не будет undefined
    res.json({ name: "Плоскогубцы", category: "ручной" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. РОУТ ДОБАВЛЕНИЯ В БАЗУ
app.post('/api/save-tool', async (req, res) => {
  try {
    const { name, category } = req.body;
    const newTool = new Tool({ name, category });
    await newTool.save();
    res.json({ success: true, message: "Инструмент в базе!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;