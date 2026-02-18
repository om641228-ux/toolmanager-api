const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors({ origin: "https://astonishing-gumption-2b9bfc.netlify.app" }));
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ DB Error:", err.message));

const Tool = mongoose.model("Tool", new mongoose.Schema({
  name: String, image: String, date: { type: Date, default: Date.now }
}));

// Инициализируем клиент Google
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/analyze", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image" });

    // ШАГ 1: Меняем модель на Gemini 2.0 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = "Назови инструмент на фото одним словом на русском языке.";
    const imageData = {
      inlineData: {
        data: req.file.buffer.toString("base64"),
        mimeType: req.file.mimetype
      }
    };

    const result = await model.generateContent([prompt, imageData]);
    const toolName = result.response.text().trim();

    const newTool = new Tool({ name: toolName, image: req.file.buffer.toString("base64") });
    await newTool.save();

    res.json({ success: true, toolName, imageData: newTool.image });
  } catch (error) {
    console.error("AI Error:", error.message);
    res.status(500).json({ error: "Google AI Error: " + error.message });
  }
});

app.get("/api/tools/tree", async (req, res) => {
  try {
    const tools = await Tool.find().sort({ date: -1 });
    res.json(tools);
  } catch (e) { res.status(500).json([]); }
});

module.exports = app;