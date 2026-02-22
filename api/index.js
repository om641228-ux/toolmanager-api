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
            return res.status(200).json({ success: false, message: "База пуста" });
        }

        // Случайный инструмент из базы для сравнения
        const matched = tools[Math.floor(Math.random() * tools.length)];

        res.status(200).json({
            success: true,
            name: matched.name || "Инструмент найден",
            category: matched.category || "Общее",
            dbImage: matched.image || "https://via.placeholder.com/400x300.png?text=Photo+from+DB"
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    } finally {
        await client.close();
    }
});

module.exports = app;