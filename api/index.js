const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const uri = "mongodb+srv://admin:MMAMVM@cluster0.jt4tijh.mongodb.net/toolmanager?retryWrites=true&w=majority";
const client = new MongoClient(uri);

// Универсальный обработчик для пути /api
app.get('/api', async (req, res) => {
    try {
        await client.connect();
        const db = client.db("toolmanager");
        const tools = await db.collection("tools").find().toArray();
        res.status(200).json(tools);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Обработчик для сохранения
app.post('/api', async (req, res) => {
    try {
        await client.connect();
        const db = client.db("toolmanager");
        const result = await db.collection("tools").insertOne({
            ...req.body,
            date: new Date()
        });
        res.status(201).json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = app;