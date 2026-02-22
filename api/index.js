const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://admin:MMAMVM@cluster0.jt4tijh.mongodb.net/toolmanager?retryWrites=true&w=majority";
const client = new MongoClient(uri);

module.exports = async (req, res) => {
    // Включаем CORS вручную (это уберет ошибки в браузере)
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

        // Берем случайный инструмент для сравнения
        const matched = tools.length > 0 ? tools[Math.floor(Math.random() * tools.length)] : null;

        if (!matched) {
            return res.status(200).json({ success: false, message: "База пуста" });
        }

        return res.status(200).json({
            success: true,
            name: matched.name,
            dbImage: matched.image || "https://via.placeholder.com/300?text=No+Photo+in+DB"
        });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    } finally {
        await client.close();
    }
};