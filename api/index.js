const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const uri = "mongodb+srv://admin:MMAMVM@cluster0.jt4tijh.mongodb.net/toolmanager?retryWrites=true&w=majority";
const client = new MongoClient(uri);

// Глобальная переменная для базы данных
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) return cachedDb;
    await client.connect();
    cachedDb = client.db("toolmanager");
    return cachedDb;
}

// Маршрут для склада (должен вернуть 43 инструмента)
app.get('/api/tools', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const tools = await db.collection("tools").find({}).toArray();
        res.status(200).json(tools);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Маршрут для ИИ
app.post('/api/identify', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const tools = await db.collection("tools").find({}).toArray();
        if (tools.length === 0) return res.json({ success: false });
        
        // Простая имитация распознавания из базы
        const randomTool = tools[Math.floor(Math.random() * tools.length)];
        res.json({ success: true, name: randomTool.name });
    } catch (e) {
        res.status(500).json({ success: false });
    }
});

module.exports = app;