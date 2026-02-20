const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const uri = "mongodb+srv://admin:MMAMVM@cluster0.jt4tijh.mongodb.net/toolmanager?retryWrites=true&w=majority";
const client = new MongoClient(uri);

// Глобальное подключение, чтобы не переподключаться каждый раз
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) return cachedDb;
    await client.connect();
    cachedDb = client.db("toolmanager"); // Твоя база
    return cachedDb;
}

// Главный путь для получения твоих 43 инструментов
app.get('/api/tools', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const tools = await db.collection("tools").find().toArray();
        res.status(200).json(tools);
    } catch (e) {
        console.error("Database Error:", e);
        res.status(500).json({ error: "Ошибка базы данных", details: e.message });
    }
});

// Для проверки работоспособности самого API
app.get('/api', (req, res) => res.send("API ToolManager Жив!"));

module.exports = app;