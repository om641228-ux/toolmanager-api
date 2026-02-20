const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const uri = "mongodb+srv://admin:MMAMVM@cluster0.jt4tijh.mongodb.net/toolmanager?retryWrites=true&w=majority";
const client = new MongoClient(uri);

// Функция для безопасного получения данных
app.get('/api/tools', async (req, res) => {
    try {
        await client.connect();
        const db = client.db("toolmanager");
        const tools = await db.collection("tools").find().toArray();
        // Всегда возвращаем массив, даже если он пустой, чтобы не было ошибки .map()
        res.status(200).json(Array.isArray(tools) ? tools : []);
    } catch (e) {
        console.error("DB Error:", e);
        res.status(500).json([]); // Возвращаем пустой массив при ошибке
    } finally {
        await client.close();
    }
});

module.exports = app;