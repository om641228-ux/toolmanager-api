const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://admin:MMAMVM@cluster0.jt4tijh.mongodb.net/toolmanager?retryWrites=true&w=majority";
const client = new MongoClient(uri);

module.exports = async (req, res) => {
    // Вручную разрешаем CORS для браузера
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        await client.connect();
        const db = client.db("toolmanager");
        // Тянем твои молотки из базы
        const tools = await db.collection("tools").find({}).toArray();

        if (!tools || tools.length === 0) {
            return res.status(200).json({ success: false, message: "База MongoDB пуста" });
        }

        // Случайный инструмент из найденных 3-х документов
        const matched = tools[Math.floor(Math.random() * tools.length)];

        return res.status(200).json({
            success: true,
            name: matched.name,
            category: matched.category,
            // Добавляем заглушку, так как в твоей базе пока нет ссылок на фото
            dbImage: matched.image || "https://via.placeholder.com/400x300.png?text=Tool+from+DB"
        });
    } catch (e) {
        return res.status(500).json({ success: false, error: e.message });
    } finally {
        await client.close();
    }
};