const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const uri = "mongodb+srv://admin:MMAMVM@cluster0.jt4tijh.mongodb.net/toolmanager?retryWrites=true&w=majority";
const client = new MongoClient(uri);

// Глобальная переменная для базы
let db;

async function connectDB() {
    if (!db) {
        await client.connect();
        db = client.db("toolmanager");
    }
    return db;
}

app.get('/api/tools', async (req, res) => {
    try {
        const database = await connectDB();
        const tools = await database.collection("tools").find().toArray();
        res.status(200).json(tools); // Отдаем все 43 позиции
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Маршрут для ИИ
app.post('/api/identify', async (req, res) => {
    try {
        const database = await connectDB();
        const tools = await database.collection("tools").find().toArray();
        // Берем случайный инструмент для имитации ИИ
        const luckyTool = tools[Math.floor(Math.random() * tools.length)];
        res.json({ success: true, name: luckyTool.name });
    } catch (e) {
        res.status(500).json({ success: false });
    }
});

module.exports = app;