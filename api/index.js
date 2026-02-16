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

// Подключение к MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// 1. Получение списка инструментов (для дерева)
app.get('/api/tools/tree', async (req, res) => {
  try {
    const tree = await Tool.aggregate([{ $group: { _id: "$toolName", count: { $sum: 1 } } }]);
    res.json(tree);
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
});

// 2. УНИВЕРСАЛЬНЫЙ РОУТ (Главный: и для фото, и для текста)
app.post('/api/analyze-tool', upload.single('image'), async (req, res) => {
  try {
    let name, count, confidence, imageData = "";

    // СЦЕНАРИЙ А: Если пользователь загрузил ФОТО
    if (req.file) {
      const base64 = req.file.buffer.toString("base64");
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [
            { text: "Назови инструмент. JSON формат: {\"toolName\": \"Название\", \"count\": 1, \"confidence\": \"95%\"}. На русском." },
            { inline_data: { mime_type: req.file.mimetype, data: base64 } }
          ]}]
        })
      });
      
      const data = await response.json();

      // ЗАЩИТА 39-й СТРОКИ: Проверяем, есть ли ответ от ИИ
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error("Ошибка Gemini:", JSON.stringify(data));
        throw new Error(data.error?.message || "Gemini не ответил. Проверь API_KEY в настройках Vercel.");
      }
      
      const resultText = data.candidates[0].content.parts[0].text;
      const result = JSON.parse(resultText.match(/\{.*\}/s)[0]);
      
      name = result.toolName;
      count = result.count || 1;
      confidence = result.confidence;
      imageData = `data:${req.file.mimetype};base64,${base64}`;
    } 
    // СЦЕНАРИЙ Б: Если пришел только ТЕКСТ (без файла)
    else {
      name = req.body.name || "Инструмент без названия";
      count = parseInt(req.body.count) || 1;
      confidence = "Manual Entry";
    }

    // Сохранение в базу MongoDB
    const toolsToAdd = Array.from({ length: count }, () => ({
      toolName: name,
      confidence: confidence,
      image: imageData
    }));
    
    await Tool.insertMany(toolsToAdd);
    res.json({ success: true, added: name, count });

  } catch (e) { 
    console.error("Server Error:", e.message);
    res.status(500).json({ error: e.message }); 
  }
});

// Старый роут для совместимости (если фронтенд стучится сюда)
app.post('/api/tools/add', async (req, res) => {
  try {
    const { name, count } = req.body;
    const toolsToAdd = Array.from({ length: parseInt(count) || 1 }, () => ({
      toolName: name || "Инструмент",
      confidence: "Direct Add",
      image: "" 
    }));
    await Tool.insertMany(toolsToAdd);
    res.json({ success: true, added: name, count: toolsToAdd.length });
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
});

module.exports = app;