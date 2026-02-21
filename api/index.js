const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();

// Полный доступ для Netlify
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

const uri = "mongodb+srv://admin:MMAMVM@cluster0.jt4tijh.mongodb.net/toolmanager?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function connect() {
    await client.connect();
    return client.db("toolmanager");
}

app.post('/api/identify', async (req, res) => {
    try {
        const db = await connect();
        const tools = await db.collection("tools").find({}).toArray();

        if (!tools.length) return res.status(404).json({ success: false });

        // Здесь происходит магия сравнения. 
        // Пока мы берем случайный инструмент для теста связи.
        const matched = tools[Math.floor(Math.random() * tools.length)];

        res.json({
            success: true,
            name: matched.name,
            category: matched.category,
            dbImage: matched.image // Важно: это поле с фото из твоей базы
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

module.exports = app;