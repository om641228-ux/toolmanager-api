const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://admin:MMAMVM@cluster0.jt4tijh.mongodb.net/toolmanager?retryWrites=true&w=majority";
const client = new MongoClient(uri);

module.exports = async (req, res) => {
    // CORS Заголовки
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { image, save, name } = req.body;

        // Временная заглушка распознавания (сюда добавим AI позже)
        const detectedName = name || "Плоскогубцы стальные";

        if (save === true) {
            await client.connect();
            const db = client.db("toolmanager");
            await db.collection("tools").insertOne({
                name: detectedName,
                image: image,
                date: new Date()
            });
            return res.status(200).json({ success: true, message: "Saved" });
        }

        // Если просто распознавание
        return res.status(200).json({ success: true, name: detectedName });

    } catch (e) {
        return res.status(500).json({ success: false, error: e.message });
    } finally {
        await client.close();
    }
};