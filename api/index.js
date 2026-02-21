const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();

// Разрешаем абсолютно все запросы, чтобы CORS нас больше не мучил
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '10mb' }));

const uri = "mongodb+srv://admin:MMAMVM@cluster0.jt4tijh.mongodb.net/toolmanager?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function getDb() {
    if (!client.topology || !client.topology.isConnected()) {
        await client.connect();
    }
    return client.db("toolmanager");
}

app.post('/api/identify', async (req, res) => {
    try {
        const db = await getDb();
        const tools = await db.collection("tools").find({}).toArray();
        
        if (!tools || tools.length === 0) {
            return res.status(404).json({ success: false, message: "База MongoDB пуста" });
        }

        // Берем случайный инструмент из твоих 43 позиций для теста
        const matched = tools[Math.floor(Math.random() * tools.length)];

        res.json({
            success: true,
            name: matched.name || "Без названия",
            category: matched.category || "Общее",
            dbImage: matched.image // Это фото из базы для сравнения
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Нужно для Vercel
module.exports = app;