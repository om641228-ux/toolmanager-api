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

// Коннект к базе
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- ЭТАП 1: ТОЛЬКО РАСПОЗНАВАНИЕ (БЕЗ СОХРАНЕНИЯ) ---
// Этот роут просто возвращает ответ от ИИ, чтобы проверить API Ключ
app.post('/api/debug/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Файл не получен" });

    const base64 = req.file.buffer.toString("base64");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [
          { text: "Назови инструмент на фото одним словом на русском языке." },
          { inline_data: { mime_type: req.file.mimetype, data: base64 } }
        ]}]
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      return res.status(500).json({ error: "Ошибка Google Gemini", details: data.error.message });
    }

    const aiText = data.candidates[0].content.parts[0].text;
    res.json({ success: true, aiResult: aiText.trim() });

  } catch (e) {
    res.status(500).json({ error: "Ошибка на Этапе 1", message: e.message });
  }
});

// --- ЭТАП 2: ТОЛЬКО СОХРАНЕНИЕ В БАЗУ ---
// Этот роут просто записывает текст, который ты пришлешь вручную
app.post('/api/debug/save', async (req, res) => {
  try {
    const { name, count } = req.body;
    
    const newEntry = new Tool({
      toolName: name || "Тестовый инструмент",
      confidence: "Manual Test",
      image: "" // Пока без фото, чтобы проверить только базу
    });

    await newEntry.save();
    res.json({ success: true, message: "Записано в MongoDB!", data: newEntry });

  } catch (e) {
    res.status(500).json({ error: "Ошибка на Этапе 2 (MongoDB)", message: e.message });
  }
});

// Получение списка (проверка дерева)
app.get('/api/tools/tree', async (req, res) => {
  try {
    const tools = await Tool.find().limit(50);
    res.json(tools);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = app;