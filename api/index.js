const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();

// 1. ИСПРАВЛЕНИЕ CORS: Разрешаем доступ сайту на Netlify
app.use(cors({
  origin: [
    "https://astonishing-gumption-2b9bfc.netlify.app",
    "http://localhost:3000"
  ],
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

// Настройка multer (хранение фото в оперативной памяти)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 2. ПОДКЛЮЧЕНИЕ К MONGODB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

const ToolSchema = new mongoose.Schema({
  name: String,
  image: String,
  date: { type: Date, default: Date.now }
});
const Tool = mongoose.model("Tool", ToolSchema);

// 3. НАСТРОЙКА ИИ (Используем модель из твоего списка)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- РОУТЫ ---

// Анализ изображения
app.post("/api/analyze", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Файл не найден" });

    // Указываем точно работающую модель
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
    res.status(500).json({ error: "Ошибка при анализе изображения" });
  }
});

// Сохранение инструмента
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

// Получение списка (дерево инструментов)
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
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));