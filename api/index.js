const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const uri = "mongodb+srv://admin:MMAMVM@cluster0.jt4tijh.mongodb.net/toolmanager?retryWrites=true&w=majority";
const client = new MongoClient(uri);

// Функция получения данных
async function getTools(req, res) {
    try {
        await client.connect();
        const db = client.db("toolmanager");
        const tools = await db.collection("tools").find().toArray();
        res.status(200).json(tools);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

// Слушаем оба варианта пути
app.get('/api/tools', getTools);
app.get('/api', getTools);

module.exports = app;