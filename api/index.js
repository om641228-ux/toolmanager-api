const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://admin:MMAMVM@cluster0.jt4tijh.mongodb.net/toolmanager?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = async (req, res) => {
    // Дублируем заголовки для надежности
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        await client.connect();
        const db = client.db("toolmanager");
        const tools = await db.collection("tools").find({}).toArray();

        const matched = tools.length > 0 ? tools[Math.floor(Math.random() * tools.length)] : null;

        return res.status(200).json({
            success: true,
            name: matched ? matched.name : "Инструмент не найден",
            dbImage: matched ? matched.image : "https://via.placeholder.com/300?text=No+Photo"
        });
    } catch (e) {
        return res.status(500).json({ success: false, error: e.message });
    } finally {
        await client.close();
    }
};