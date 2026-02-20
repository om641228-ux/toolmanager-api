const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();

// Настройка CORS: разрешаем всё, чтобы Netlify мог достучаться
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '10mb' }));

const uri = "mongodb+srv://admin:MMAMVM@cluster0.jt4tijh.mongodb.net/toolmanager?retryWrites=true&w=majority";
const client = new MongoClient(uri);

let cachedDb = null;

async function getDb() {
    if (cachedDb) return cachedDb;
    await client.connect();
    cachedDb = client.db("toolmanager");
    return cachedDb;
}

// Маршрут для списка (склада)
app.get('/api/tools', async (req, res) => {
    try {
        const db = await getDb();
        const tools = await db.collection("tools").find().toArray();
        res.status(200).json(tools);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Маршрут для ИИ
app.post('/api/identify', async (req, res) => {
    try {
        const db = await getDb();
        const tools = await db.collection("tools").find().toArray();
        // Имитация ИИ: берем инструмент из твоих 43
        const tool = tools[Math.floor(Math.random() * tools.length)];
        res.json({ success: true, name: tool.name });
    } catch (e) {
        res.status(500).json({ success: false });
    }
});

module.exports = app;