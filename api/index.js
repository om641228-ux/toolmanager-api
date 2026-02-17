require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const fetch = require('node-fetch');
const Tool = require('./models/Tool');

const app = express();
const upload = multer();

// Разрешаем CORS и увеличиваем лимит для передачи картинок
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: '50mb' }));

// Подключение к базе данных (один раз для всех функций)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- 1. ЭТАП: РАСПОЗНАВАНИЕ (Gemini) ---
app.post('/api/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) throw new Error("Файл не получен");

    const base64 = req.file.buffer.toString("base64");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const aiResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [
          { text: "Назови инструмент на фото одним словом на русском." },
          { inline_data: { mime_type: req.file.mimetype, data: base64 } }
        ]}]
      })
    });
    
    const data = await aiResponse.json();
    if (data.error) throw new Error(data.error.message);

    const name = data.candidates[0].content.parts[0].text.trim();
    
    // Возвращаем фронтенду название и само фото в base64
    res.json({ 
      success: true, 
      toolName: name, 
      imageData: `data:${req.file.mimetype};base64,${base64}` 
    });
  } catch (e) {
    console.error("AI Error:", e.message);
    res.status(500).json({ error: "Ошибка ИИ", details: e.message });
  }
});

// --- 2. ЭТАП: СОХРАНЕНИЕ В БАЗУ (MongoDB) ---
app.post('/api/save-tool', async (req, res) => {
  try {
    const { toolName, imageData } = req.body;

    const newTool = new Tool({
      toolName: toolName,
      image: imageData,
      confidence: "Confirmed by user"
    });

    await newTool.save();
    res.json({ success: true, message: "Сохранено в базу!" });
  } catch (e) {
    console.error("DB Error:", e.message);
    res.status(500).json({ error: "Ошибка базы данных", details: e.message });
  }
});

// --- ДОПОЛНИТЕЛЬНО: ПОЛУЧЕНИЕ СПИСКА ---
app.get('/api/tools/tree', async (req, res) => {
  try {
    const tree = await Tool.aggregate([{ $group: { _id: "$toolName", count: { $sum: 1 } } }]);
    res.json(tree);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = app;