const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const uri = "mongodb+srv://admin:MMAMVM@cluster0.jt4tijh.mongodb.net/toolmanager?retryWrites=true&w=majority";
const client = new MongoClient(uri);

let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) return cachedDb;
    await client.connect();
    cachedDb = client.db("toolmanager"); // Подключение к базе из Atlas
    return cachedDb;
}

app.get('/api/tools', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const tools = await db.collection("tools").find().toArray();
        res.status(200).json(tools); // Отправка всех 43 инструментов
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Маршрут для будущей интеграции реального ИИ
app.post('/api/identify', async (req, res) => {
    // Здесь будет логика сравнения фото с базой
    res.json({ message: "Ready for AI model" });
});

module.exports = app;