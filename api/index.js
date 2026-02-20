const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const uri = "mongodb+srv://admin:MMAMVM@cluster0.jt4tijh.mongodb.net/toolmanager?retryWrites=true&w=majority";
const client = new MongoClient(uri);

let cachedDb = null;

async function getDb() {
    if (cachedDb) return cachedDb;
    await client.connect();
    cachedDb = client.db("toolmanager"); // Твоя база
    return cachedDb;
}

app.get('/api/tools', async (req, res) => {
    try {
        const db = await getDb();
        const tools = await db.collection("tools").find().toArray();
        res.status(200).json(tools); // Отправляем все 43 инструмента
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Ошибка сервера", details: e.message });
    }
});

// Заглушка для будущего реального ИИ
app.post('/api/identify', (req, res) => {
    res.json({ status: "ready" });
});

module.exports = app;