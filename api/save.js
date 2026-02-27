const { MongoClient } = require('mongodb');

module.exports = async (req, res) => {
  // 1. Настройка заголовков для работы с фронтендом (Netlify)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Ответ на предварительный запрос браузера
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Нужен POST запрос' });
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return res.status(500).json({ success: false, error: 'MONGODB_URI не настроен в Vercel' });
  }

  const client = new MongoClient(uri);

  try {
    const { item } = req.body;
    
    if (!item || !item.name) {
      return res.status(400).json({ success: false, error: 'Данные инструмента неполные' });
    }

    await client.connect();
    
    // Имя базы: toolmanager, коллекция: inventory
    const db = client.db('toolmanager');
    const collection = db.collection('inventory');

    const result = await collection.insertOne({
      ...item,
      addedAt: new Date(),
    });

    return res.status(200).json({ success: true, id: result.insertedId });
  } catch (err) {
    console.error("Ошибка Mongo:", err);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    await client.close();
  }
};