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

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// РОУТ 1: Распознавание через ИИ
app.post('/api/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) throw new Error("Файл не получен");
    const base64 = req.file.buffer.toString("base64");
    
    // Запрос к Gemini (делает сервер, поэтому 403 не будет)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const aiResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [
          { text: "Назови инструмент на фото ОДНИМ словом на русском языке. Ответ дай в формате JSON: {\"toolName\": \"название\"}" },
          { inline_data: { mime_type: req.file.mimetype, data: base64 } }
        ]}]
      })
    });
    
    const data = await aiResponse.json();
    const aiText = data.candidates[0].content.parts[0].text;
    const aiResult = JSON.parse(aiText.match(/\{.*\}/s)[0]); // Вытаскиваем JSON из текста
    
    res.json({ 
      success: true, 
      toolName: aiResult.toolName, 
      imageData: `data:${req.file.mimetype};base64,${base64}` 
    });
  } catch (e) {
    res.status(500).json({ error: "Ошибка ИИ", details: e.message });
  }
});

// РОУТ 2: Сохранение в базу
app.post('/api/save-tool', async (req, res) => {
  try {
    const { toolName, imageData } = req.body;
    const newTool = new Tool({ toolName, image: imageData });
    await newTool.save();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// РОУТ 3: Получение списка
app.get('/api/tools/tree', async (req, res) => {
  try {
    const tree = await Tool.aggregate([{ $group: { _id: "$toolName", count: { $sum: 1 } } }]);
    res.json(tree);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = app;