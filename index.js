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
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

app.get('/api/tools/tree', async (req, res) => {
  const tree = await Tool.aggregate([{ $group: { _id: "$toolName", count: { $sum: 1 } } }]);
  res.json(tree);
});

app.get('/api/tools/folder/:name', async (req, res) => {
  const items = await Tool.find({ toolName: req.params.name }).sort({ createdAt: -1 });
  res.json(items);
});

app.post('/api/analyze-tool', upload.single('image'), async (req, res) => {
  try {
    const base64 = req.file.buffer.toString("base64");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [
          { text: "Назови инструмент. JSON формат: {\"toolName\": \"Название\", \"confidence\": \"95%\"}. На русском." },
          { inline_data: { mime_type: req.file.mimetype, data: base64 } }
        ]}]
      })
    });

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    const result = JSON.parse(resultText.match(/\{.*\}/s)[0]);

    const newTool = new Tool({
      toolName: result.toolName,
      confidence: result.confidence,
      image: `data:${req.file.mimetype};base64,${base64}`
    });

    await newTool.save();
    res.json(newTool);
  } catch (e) { res.status(500).json({error: e.message}); }
});

app.delete('/api/tools/:id', async (req, res) => {
  await Tool.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server on ${PORT}`));
module.exports = app;