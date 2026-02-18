const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
// Добавь здесь другие импорты своих роутов, если они были

const app = express();

// ИСПРАВЛЕНИЕ CORS: Разрешаем запросы с любого адреса
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Твой URL для подключения к MongoDB (убедись, что он правильный)
const MONGODB_URI = process.env.MONGODB_URI || "твой_адрес_монго_из_vercel_env";

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// ПРИМЕР РОУТА (оставь свои существующие роуты здесь)
app.get('/api/tools/tree', async (req, res) => {
    try {
        // Твоя логика получения данных из базы
        res.json({ message: "Данные успешно получены" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Важно для Vercel
module.exports = app;

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}