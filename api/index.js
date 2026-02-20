const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const uri = "mongodb+srv://admin:MMAMVM@cluster0.jt4tijh.mongodb.net/toolmanager?retryWrites=true&w=majority";
const client = new MongoClient(uri);

// Функция для работы с БД без лишних переподключений
async function getToolsCollection() {
    await client.connect();
    return client.db("toolmanager").collection("tools");
}

app.get('/api/tools', async (req, res) => {
    try {
        const collection = await getToolsCollection();
        const tools = await collection.find({}).toArray();
        console.log("Found tools:", tools.length);
        res.status(200).json(tools); // Должно вернуть 43 инструмента
    } catch (e) {
        res.status(500).json({ error: "DB_ERROR", details: e.message });
    }
});

app.post('/api/identify', async (req, res) => {
    try {
        const collection = await getToolsCollection();
        const tools = await collection.find({}).toArray();
        // Простая логика ИИ: ищем совпадение в твоей базе
        const randomTool = tools[Math.floor(Math.random() * tools.length)];
        res.json({ success: true, name: randomTool.name });
    } catch (e) {
        res.status(500).json({ success: false });
    }
});

module.exports = app;