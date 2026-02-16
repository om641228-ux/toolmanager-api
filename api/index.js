require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const fetch = require('node-fetch');
const Tool = require('./models/Tool');
const app = express();
const upload = multer();

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: '50mb' }));

// Подключение к базе
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ База MongoDB на связи'))
  .catch(err => console.error('❌ Ошибка MongoDB:', err));

// --- ЭТАП 1: ТОЛЬКО РАСПОЗНАВАНИЕ (БЕЗ СОХРАНЕНИЯ) ---
app.post('/api/test-ai', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Нет фото для теста" });

    const base64 = req.file.buffer.toString("base64");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [
          { text: "Что на фото? Ответь только названием инструмента на русском." },
          { inline_data: { mime_type: req.file.mimetype, data: base64 } }
        ]}]
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      return res.status(500).json({ error: "Ошибка Gemini", details: data.error.message });
    }

    const aiText = data.candidates[0].content.parts[0].text;
    res.json({ success: true, whatAISee: aiText });

  } catch (e) {
    res.status(500).json({ error: "Ошибка сервера при тесте ИИ", message: e.message });
  }
});

// --- ЭТАП 2: ТОЛЬКО ДОБАВЛЕНИЕ В БАЗУ ---
app.post('/api/tools/add', async (req, res) => {
  try {
    const { name, count } = req.body;
    
    const newTool = new Tool({
      toolName: name || "Тестовый инструмент",
      confidence: "Manual",
      image: "" // Пока без фото для простоты
    });

    await newTool.save();
    res.json({ success: true, message: "В базу сохранено!", tool: newTool });

  } catch (e) {
    res.status(500).json({ error: "Ошибка базы данных", message: e.message });
  }
});

// Роут для получения списка (чтобы видеть результат)
app.get('/api/tools/tree', async (req, res) => {
  const tools = await Tool.find().limit(10);
  res.json(tools);
});

module.exports = app;