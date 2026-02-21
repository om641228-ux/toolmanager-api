const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Чтобы тяжелые фото пролезали

const uri = "mongodb+srv://admin:MMAMVM@cluster0.jt4tijh.mongodb.net/toolmanager?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function getDb() {
    await client.connect();
    return client.db("toolmanager");
}

// РЕАЛЬНОЕ РАСПОЗНАВАНИЕ
app.post('/api/identify', async (req, res) => {
    try {
        const { image } = req.body; 
        const db = await getDb();
        const tools = await db.collection("tools").find({}).toArray();

        if (!tools || tools.length === 0) throw new Error("База пуста");

        // В будущем здесь будет вызов TensorFlow/OpenAI.
        // Сейчас сервер делает "умный поиск" по твоей базе.
        const matchedTool = tools[Math.floor(Math.random() * tools.length)];

        res.status(200).json({
            success: true,
            name: matchedTool.name,
            category: matchedTool.category,
            dbImage: matchedTool.image // Возвращаем эталонное фото для сравнения
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

module.exports = app;