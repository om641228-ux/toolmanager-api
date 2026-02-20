const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();

// Разрешаем запросы с любого адреса и увеличиваем лимит для фото
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Твой проверенный URI
const uri = "mongodb+srv://admin:MMAMVM@cluster0.jt4tijh.mongodb.net/toolmanager?retryWrites=true&w=majority";
const client = new MongoClient(uri);

// Кешируем соединение, чтобы Vercel не выдавал ошибку 500
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) return cachedDb;
    await client.connect();
    cachedDb = client.db("toolmanager"); // Подключаемся именно к твоей базе
    return cachedDb;
}

// Главный путь для фронтенда
app.get('/api/tools', async (req, res) => {
    try {
        const db = await connectToDatabase();
        // Забираем все 43 инструмента
        const tools = await db.collection("tools").find().toArray();
        res.status(200).json(tools);
    } catch (e) {
        console.error("Ошибка базы:", e);
        res.status(500).json({ error: "Ошибка MongoDB", details: e.message });
    }
});

// Слушаем также и корень /api для тестов
app.get('/api', async (req, res) => {
    res.send("API ToolManager работает. Используй /api/tools для данных.");
});

module.exports = app;