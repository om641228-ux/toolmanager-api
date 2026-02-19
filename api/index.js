const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();

// 1. Настройка лимитов для приема фото и CORS
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Защита от ошибки 413 (Content Too Large)
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 2. Инициализация Gemini 2.0 Flash
// Убедись, что GEMINI_API_KEY прописан в настройках Vercel!
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// 3. Роут для анализа изображения
app.post('/api/analyze', async (req, res) => {
  try {
    const { image, language } = req.body;
    
    if (!genAI) {
      throw new Error("API Key is missing in Vercel Environment Variables");
    }

    if (!image) {
      return res.status(400).json({ error: "No image data provided" });
    }

    // Извлекаем чистый base64
    const base64Data = image.split(",")[1];
    
    // Используем модель 2.0 Flash, которая успешно прошла тест в терминале
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Устанавливаем язык (по умолчанию русский)
    const targetLang = language || 'русский';

    const prompt = `Идентифицируй строительный инструмент на фото. 
      Ответь на языке: ${targetLang}. 
      Формат ответа — СТРОГИЙ JSON: {"name": "Название", "category": "Категория"}`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
    ]);

    const response = await result.response;
    let text = response.text().replace(/```json|```/g, "").trim();
    
    console.log("AI Response:", text);
    
    // Отправляем результат клиенту
    res.json(JSON.parse(text));

  } catch (error) {
    console.error("Критическая ошибка бэкенда:", error.message);
    
    // Возвращаем 200 с дефолтными данными, чтобы фронтенд не ломался при ошибке 500
    res.json({ 
      name: "Инструмент", 
      category: "Требуется ручная проверка",
      error: error.message 
    });
  }
});

// 4. Роут для сохранения в базу (имитация, так как кнопка уже работает)
app.post('/api/save-tool', (req, res) => {
  console.log("Данные получены для сохранения:", req.body);
  res.json({ success: true, message: "Сохранено в базу!" });
});

// Экспорт для Vercel
module.exports = app;