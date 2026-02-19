const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const uri = "mongodb+srv://admin:MMAMVM@cluster0.jt4tijh.mongodb.net/toolmanager?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function getDB() {
    if (!client.topology || !client.topology.isConnected()) await client.connect();
    return client.db("toolmanager");
}

// Эндпоинт для получения всех инструментов
app.get('/api/tools', async (req, res) => {
    try {
        const db = await getDB();
        const tools = await db.collection("tools").find().toArray();
        res.status(200).json(tools);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Эндпоинт для сохранения
app.post('/api/tools', async (req, res) => {
    try {
        const db = await getDB();
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