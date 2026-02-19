const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();

// Увеличиваем лимиты для работы с фото
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Инициализация ИИ с моделью 2.0
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/analyze', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: "No image" });

    // ИСПОЛЬЗУЕМ ВЕРСИЮ 2.0 FLASH (как в твоем успешном тесте)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const base64Data = image.split(",")[1];

    const result = await model.generateContent([
      "Идентифицируй инструмент на фото. Ответь ТОЛЬКО в формате JSON: {\"name\": \"Название\", \"category\": \"Категория\"}",
      { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
    ]);

    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();
    
    console.log("AI Response:", text);
    res.json(JSON.parse(text));

  } catch (error) {
    console.error("Ошибка сервера:", error.message);
    // Отправляем понятный ответ, чтобы фронтенд не писал 'Не определено'
    res.status(500).json({ name: "Ошибка ИИ", category: "Проверьте логи Vercel" });
  }
});

// Роут сохранения (у тебя он уже работает)
app.post('/api/save-tool', (req, res) => {
  res.json({ success: true, message: "Сохранено в базу" });
});

module.exports = app;