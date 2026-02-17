const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Настройка хранилища для фото в памяти
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// Схема базы данных
const ToolSchema = new mongoose.Schema({
  name: String,
  image: String, // Base64
  date: { type: Date, default: Date.now }
});
const Tool = mongoose.model("Tool", ToolSchema);

// Инициализация Google AI (Ключ берется из настроек Vercel)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- РОУТЫ ---

// 1. Анализ изображения через ИИ
app.post("/api/analyze", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Файл не загружен" });
    }

    // Используем проверенную модель из твоего списка
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const imageParts = [
      {
        inlineData: {
          data: req.file.buffer.toString("base64"),
          mimeType: req.file.mimetype,
        },
      },
    ];

    const result = await model.generateContent([
      "Назови одним или двумя словами на русском языке, какой строительный инструмент на фото. Верни только название.",
      ...imageParts,
    ]);

    const toolName = result.response.text().trim();
    
    res.json({ 
      success: true, 
      toolName, 
      imageData: req.file.buffer.toString("base64") 
    });
  } catch (error) {
    console.error("❌ Ошибка ИИ:", error);
    res.status(500).json({ error: "Ошибка при анализе ИИ" });
  }
});

// 2. Сохранение в базу
app.post("/api/save-tool", async (req, res) => {
  try {
    const { toolName, imageData } = req.body;
    const newTool = new Tool({ name: toolName, image: imageData });
    await newTool.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Ошибка сохранения" });
  }
});

// 3. Получение списка (агрегация по именам)
app.get("/api/tools/tree", async (req, res) => {
  try {
    const tree = await Tool.aggregate([
      { $group: { _id: "$name", count: { $sum: 1 } } }
    ]);
    res.json(tree);
  } catch (error) {
    res.status(500).json({ error: "Ошибка загрузки данных" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));