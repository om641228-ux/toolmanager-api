const { MongoClient } = require('mongodb');

module.exports = async (req, res) => {
  // 1. ПРАВИЛЬНЫЕ ЗАГОЛОВКИ CORS (Разрешаем Netlify стучаться в Vercel)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Ответ на предварительную проверку браузера
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: "Нужен POST запрос" });
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return res.status(500).json({ success: false, error: "MONGODB_URI не настроен в Vercel" });
  }

  const client = new MongoClient(uri);

  try {
    const { item } = req.body;
    if (!item) throw new Error("Данные для сохранения отсутствуют");

    await client.connect();
    
    // ИМЯ БАЗЫ: toolmanager, КОЛЛЕКЦИЯ: inventory
    const db = client.db('toolmanager'); 
    const collection = db.collection('inventory');

    const result = await collection.insertOne({
      ...item,
      addedAt: new Date(),
      status: 'added_by_ai'
    });

    console.log("Успешно сохранено:", result.insertedId);
    return res.status(200).json({ success: true, id: result.insertedId });

  } catch (err) {
    console.error("Ошибка сохранения в Mongo:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    await client.close();
  }
};