const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();

// Простое включение для всех доменов
app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

const ToolSchema = new mongoose.Schema({
  name: String,
  image: String,
  date: { type: Date, default: Date.now }
});
const Tool = mongoose.model("Tool", ToolSchema);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/analyze", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file" });
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const imageParts = [{ inlineData: { data: req.file.buffer.toString("base64"), mimeType: req.file.mimetype } }];
    const result = await model.generateContent(["Назови инструмент на фото одним словом на русском.", ...imageParts]);
    res.json({ success: true, toolName: result.response.text().trim(), imageData: req.file.buffer.toString("base64") });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/tools/tree", async (req, res) => {
  try {
    const tree = await Tool.aggregate([{ $group: { _id: "$name", count: { $sum: 1 } } }]);
    res.json(tree);
  } catch (e) { res.status(500).json([]); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server ok on ${PORT}`));