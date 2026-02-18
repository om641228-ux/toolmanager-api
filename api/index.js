const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

// 1. Увеличиваем лимиты для тяжелых фото и разрешаем доступ Netlify
app.use(cors({
  origin: "https://astonishing-gumption-2b9bfc.netlify.app",
  methods: ["POST", "GET", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

// ВАЖНО: Эти строки лечат ошибку 413 (Payload Too Large)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

const upload = multer({ storage: multer.memoryStorage() });

// Подключение к базе
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ DB Error:", err.message));

const Tool = mongoose.model("Tool", new mongoose.Schema({
  name: String, 
  image: String, 
  date: { type: Date, default: Date.now }
}));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Маршрут анализа
app.post("/api/analyze", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image" });
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent([
      "Назови инструмент на фото ОДНИМ словом на русском языке.",
      { inlineData: { data: req.file.buffer.toString("base64"), mimeType: req.file.mimetype } }
    ]);
    const toolName = result.response.text().trim();
    res.json({ success: true, toolName, imageData: req.file.buffer.toString("base64") });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Маршрут сохранения (теперь с поддержкой 10МБ)
app.post("/api/save-tool", async (req, res) => {
  try {
    const { name, image } = req.body;
    if (!name || !image) return res.status(400).json({ error: "Missing data" });
    
    const newTool = new Tool({ name, image });
    await newTool.save();
    res.json({ success: true, message: "Инструмент сохранен в базу!" });
  } catch (error) {
    console.error("Save error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/tools/tree", async (req, res) => {
  try {
    const tools = await Tool.find().sort({ date: -1 });
    res.json(tools);
  } catch (e) { res.status(500).json([]); }
});

module.exports = app;