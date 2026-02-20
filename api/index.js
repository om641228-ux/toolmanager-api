const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const uri = "mongodb+srv://admin:MMAMVM@cluster0.jt4tijh.mongodb.net/toolmanager?retryWrites=true&w=majority";
const client = new MongoClient(uri);

// Маршрут для распознавания инструмента
app.post('/api/identify', async (req, res) => {
    try {
        await client.connect();
        const db = client.db("toolmanager");
        const tools = await db.collection("tools").find().toArray();
        
        // В будущем здесь будет вызов модели ИИ. 
        // Сейчас мы имитируем выбор лучшего совпадения из твоих 43 инструментов
        const identified = tools[Math.floor(Math.random() * tools.length)];
        
        res.status(200).json({
            success: true,
            name: identified.name,
            category: identified.category,
            image: identified.image
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    } finally {
        await client.close();
    }
});

module.exports = app;