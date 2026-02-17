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
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- ГЛАВНЫЙ РОУТ (РАЗДЕЛЕННЫЙ) ---
app.post('/api/analyze-tool', upload.single('image'), async (req, res) => {
  try {
    // --- ЭТАП 1: ТОЛЬКО РАСПОЗНАВАНИЕ (GEMINI) ---
    console.log("Stage 1: AI Recognition Start");
    
    if (!req.file) throw new Error("Файл не получен сервером");

    const base64 = req.file.buffer.toString("base64");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const aiResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [
          { text: "Назови инструмент на фото одним словом на русском языке. Ответ дай строго в формате JSON: {\"toolName\": \"название\"}" },
          { inline_data: { mime_type: req.file.mimetype, data: base64 } }
        ]}]
      })
    });
    
    const aiData = await aiResponse.json();

    if (!aiData.candidates || !aiData.candidates[0]) {
      console.error("AI Error Details:", JSON.stringify(aiData));
      return res.status(500).json({ error: "Ошибка ИИ (Stage 1)", details: aiData.error?.message || "Пустой ответ" });
    }

    const aiText = aiData.candidates[0].content.parts[0].text;
    const aiResult = JSON.parse(aiText.match(/\{.*\}/s)[0]);
    
    console.log("Stage 1 Success: AI saw", aiResult.toolName);

    // --- ЭТАП 2: ТОЛЬКО СОХРАНЕНИЕ (MONGODB) ---
    console.log("Stage 2: Database Saving Start");

    const newTool = new Tool({
      toolName: aiResult.toolName,
      confidence: "AI Generated",
      image: `data:${req.file.mimetype};base64,${base64}`
    });

    await newTool.save();
    console.log("Stage 2 Success: Tool saved to DB");

    res.json({ success: true, toolName: aiResult.toolName });

  } catch (e) {
    console.error("Critical Error:", e.message);
    res.status(500).json({ 
      error: "Ошибка обработки", 
      message: e.message,
      stage: e.message.includes("database") ? "Database" : "AI/Internal"
    });
  }
});

// Получение списка для дерева
app.get('/api/tools/tree', async (req, res) => {
  try {
    const tree = await Tool.aggregate([{ $group: { _id: "$toolName", count: { $sum: 1 } } }]);
    res.json(tree);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = app;