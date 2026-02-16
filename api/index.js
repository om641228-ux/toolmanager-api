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

// Подключение к базе данных
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));

// 1. Получение инвентаря для дерева
app.get('/api/tools/tree', async (req, res) => {
  try {
    const tree = await Tool.aggregate([{ $group: { _id: "$toolName", count: { $sum: 1 } } }]);
    res.json(tree);
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
});

// 2. УНИВЕРСАЛЬНЫЙ РОУТ (Для фото и текста)
app.post('/api/analyze-tool', upload.single('image'), async (req, res) => {
  try {
    let name, count, confidence, imageData = "";

    // ЕСЛИ ПОЛЬЗОВАТЕЛЬ ЗАГРУЗИЛ ФОТО
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
      
      if (!data.candidates) throw new Error("Gemini не ответил. Проверь API ключ.");
      
      const resultText = data.candidates[0].content.parts[0].text;
      const result = JSON.parse(resultText.match(/\{.*\}/s)[0]);
      
      name = result.toolName;
      count = result.count || 1;
      confidence = result.confidence;
      imageData = `data:${req.file.mimetype};base64,${base64}`;
    } 
    // ЕСЛИ ЭТО ПРОСТО ТЕКСТ (нажата кнопка без фото)
    else {
      name = req.body.name || "Неизвестный инструмент";
      count = parseInt(req.body.count) || 1;
      confidence = "Manual Entry";
    }

    // Сохранение в базу (создаем массив объектов)
    const toolsToAdd = Array.from({ length: count }, () => ({
      toolName: name,
      confidence: confidence,
      image: imageData
    }));
    
    await Tool.insertMany(toolsToAdd);
    res.json({ success: true, added: name, count });

  } catch (e) { 
    console.error("Ошибка сервера:", e.message);
    res.status(500).json({ error: e.message }); 
  }
});

module.exports = app;