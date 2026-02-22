const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://admin:MMAMVM@cluster0.jt4tijh.mongodb.net/toolmanager?retryWrites=true&w=majority";
const client = new MongoClient(uri);

module.exports = async (req, res) => {
    // Включаем заголовки CORS вручную
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Ответ на предварительный запрос браузера
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        await client.connect();
        const db = client.db("toolmanager");
        // Ищем твои "ТЕРМИНАЛЬНЫЕ МОЛОТКИ"
        const tools = await db.collection("tools").find({}).toArray();

        if (!tools || tools.length === 0) {
            return res.status(200).json({ success: false, message: "База пуста" });
        }

        const matched = tools[Math.floor(Math.random() * tools.length)];

        res.status(200).json({
            success: true,
            name: matched.name,
            category: matched.category,
            // Ссылка-заглушка, так как в твоей базе пока нет фото
            dbImage: "https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?w=400" 
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    } finally {
        await client.close();
    }
};