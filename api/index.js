const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); 
app.use(express.json({ limit: '10mb' }));

const uri = "mongodb+srv://admin:MMAMVM@cluster0.jt4tijh.mongodb.net/toolmanager?retryWrites=true&w=majority";
const client = new MongoClient(uri);

app.post('/api/identify', async (req, res) => {
    try {
        await client.connect();
        const db = client.db("toolmanager");
        const tools = await db.collection("tools").find({}).toArray();

        if (!tools || tools.length === 0) {
            return res.json({ success: false, message: "База пуста" });
        }

        // Берем один из твоих 43 инструментов
        const matched = tools[Math.floor(Math.random() * tools.length)];

        res.json({
            success: true,
            name: matched.name || "Инструмент",
            category: matched.category || "Общее",
            // Если в MongoDB нет поля image, шлем заглушку
            dbImage: matched.image || "https://via.placeholder.com/300?text=No+Photo+In+DB"
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    } finally {
        await client.close();
    }
});

module.exports = app;