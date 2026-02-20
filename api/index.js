const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();

// Полное разрешение CORS для работы с Netlify
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
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

// Маршрут для получения всех 43 инструментов
app.get('/api/tools', async (req, res) => {
    try {
        const db = await getDb();
        const tools = await db.collection("tools").find().toArray();
        res.status(200).json(tools);
    } catch (e) {
        res.status(500).json([]);
    }
});

// Маршрут для имитации распознавания
app.post('/api/identify', async (req, res) => {
    try {
        const db = await getDb();
        const tools = await db.collection("tools").find().toArray();
        // Имитируем ИИ, выбирая случайный инструмент из базы
        const identified = tools[Math.floor(Math.random() * tools.length)];
        res.json({ success: true, name: identified.name });
    } catch (e) {
        res.status(500).json({ success: false });
    }
});

module.exports = app;