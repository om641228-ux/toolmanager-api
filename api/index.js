const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();

// Снимаем блокировку CORS для Netlify
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '10mb' }));

const uri = "mongodb+srv://admin:MMAMVM@cluster0.jt4tijh.mongodb.net/toolmanager?retryWrites=true&w=majority";
const client = new MongoClient(uri);

let dbInstance = null;

async function getDb() {
    if (dbInstance) return dbInstance;
    await client.connect();
    dbInstance = client.db("toolmanager");
    return dbInstance;
}

// Маршрут для получения всех 43 инструментов
app.get('/api/tools', async (req, res) => {
    try {
        const db = await getDb();
        const tools = await db.collection("tools").find().toArray();
        res.status(200).json(tools);
    } catch (e) {
        console.error(e);
        res.status(500).json([]); // Возвращаем пустой массив вместо ошибки 500
    }
});

// Маршрут для распознавания
app.post('/api/identify', async (req, res) => {
    try {
        const db = await getDb();
        const tools = await db.collection("tools").find().toArray();
        // Имитация ИИ: выбираем инструмент из базы
        const tool = tools[Math.floor(Math.random() * tools.length)];
        res.json({ success: true, name: tool.name });
    } catch (e) {
        res.status(500).json({ success: false });
    }
});

module.exports = app;