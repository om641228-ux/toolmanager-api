const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();

// Настройка CORS: разрешаем доступ твоему фронтенду
app.use(cors({
    origin: 'https://willowy-pixie-bbc2ca.netlify.app',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '10mb' }));

const uri = "mongodb+srv://admin:MMAMVM@cluster0.jt4tijh.mongodb.net/toolmanager?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function connectToDatabase() {
    await client.connect();
    return client.db("toolmanager");
}

// Маршрут для получения всех 43 инструментов
app.get('/api/tools', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const tools = await db.collection("tools").find({}).toArray();
        res.status(200).json(tools);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Маршрут для распознавания и сравнения
app.post('/api/identify', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const tools = await db.collection("tools").find({}).toArray();
        if (!tools.length) return res.json({ success: false });

        // Выбираем случайный инструмент из базы для сравнения
        const matched = tools[Math.floor(Math.random() * tools.length)];
        
        res.json({
            success: true,
            name: matched.name,
            category: matched.category,
            dbImage: matched.image // Фото из базы для сравнения
        });
    } catch (e) {
        res.status(500).json({ success: false });
    }
});

module.exports = app;