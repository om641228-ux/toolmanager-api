const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// Подключение к БД
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

const Tool = mongoose.model("Tool", new mongoose.Schema({
  name: String, image: String, date: { type: Date, default: Date.now }
}));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Роут для распознавания
app.post("/api/analyze", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No file uploaded");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
      "Назови инструмент на фото одним словом на русском.",
      { inlineData: { data: req.file.buffer.toString("base64"), mimeType: req.file.mimetype } }
    ]);

    res.json({ 
      success: true, 
      toolName: result.response.text().trim(), 
      imageData: req.file.buffer.toString("base64") 
    });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Роут для списка
app.get("/api/tools/tree", async (req, res) => {
  try {
    const tree = await Tool.aggregate([{ $group: { _id: "$name", count: { $sum: 1 } } }]);
    res.json(tree);
  } catch (e) { res.status(500).json([]); }
});

module.exports = app;
