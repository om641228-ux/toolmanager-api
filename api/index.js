const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();

// Разрешаем CORS программно
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const uri = "mongodb+srv://admin:MMAMVM@cluster0.jt4tijh.mongodb.net/toolmanager?retryWrites=true&w=majority";
const client = new MongoClient(uri);

// Обработка предварительных (Preflight) запросов
app.options('*', cors());

app.post('/api/identify', async (req, res) => {
    try {
        await client.connect();
        const db = client.db("toolmanager");
        // Получаем все инструменты, чтобы было с чем сравнивать
        const tools = await db.collection("tools").find({}).toArray();

        if (!tools || tools.length === 0) {
            return res.json({ success: false, message: "База в MongoDB пуста" });
        }

        // Берем случайный инструмент из твоих 43 позиций
        const matched = tools[Math.floor(Math.random() * tools.length)];

        res.json({
            success: true,
            name: matched.name || "Инструмент",
            category: matched.category || "Проверка",
            // Если в базе нет ссылки на фото, используем картинку-заглушку
            dbImage: matched.image || "https://via.placeholder.com/300?text=No+Photo+In+DB"
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    } finally {
        await client.close();
    }
});

module.exports = app;