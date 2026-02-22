const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://admin:MMAMVM@cluster0.jt4tijh.mongodb.net/toolmanager?retryWrites=true&w=majority";
const client = new MongoClient(uri);

module.exports = async (req, res) => {
    // ЖЕСТКИЙ CORS: Разрешаем всё и всем прямо на входе
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Если браузер просто "спрашивает" разрешение (OPTIONS), сразу отвечаем "ОК"
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Если это основной запрос (POST)
    if (req.method === 'POST') {
        try {
            await client.connect();
            const db = client.db("toolmanager");
            const tools = await db.collection("tools").find({}).toArray();

            if (!tools || tools.length === 0) {
                return res.status(200).json({ success: false, message: "База пуста" });
            }

            // Берем случайный инструмент из твоих 43 позиций
            const matched = tools[Math.floor(Math.random() * tools.length)];

            return res.status(200).json({
                success: true,
                name: matched.name || "Инструмент найден",
                category: matched.category || "Общее",
                dbImage: matched.image || "https://via.placeholder.com/300?text=Tool+from+DB"
            });
        } catch (e) {
            return res.status(500).json({ success: false, error: e.message });
        } finally {
            await client.close();
        }
    }

    // На любой другой метод отвечаем ошибкой
    return res.status(405).json({ message: "Only POST allowed" });
};