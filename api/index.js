const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// ИСПРАВЛЕНИЕ CORS: Теперь сервер примет запросы от любого твоего домена
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Подключение к базе (используем переменную из Vercel)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Твой основной роут для анализа (судя по логам, он вызывается чаще всего)
app.post('/api/analyze', async (req, res) => {
  try {
    // Здесь твоя логика анализа через ИИ
    res.status(200).json({ success: true, message: "Анализ выполнен" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Роут для получения списка инструментов
app.get('/api/tools', async (req, res) => {
  try {
    // Здесь получение данных из коллекции
    res.status(200).json({ tools: [] }); 
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Экспорт для Vercel
module.exports = app;

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
}