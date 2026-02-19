const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Разрешаем CORS для всех (устраняет блокировку fetch)
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ DB Error:', err));

const Tool = mongoose.model('Tool', new mongoose.Schema({
  name: String,
  category: String,
  date: { type: Date, default: Date.now }
}));

// Роут анализа (распознавание)
app.post('/api/analyze', async (req, res) => {
  try {
    // Временная заглушка, чтобы проверить связь
    res.json({ name: "Молоток", category: "Ручной инструмент" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Роут сохранения (исправляет 404)
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