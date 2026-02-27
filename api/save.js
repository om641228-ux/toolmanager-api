const { MongoClient } = require('mongodb');

module.exports = async (req, res) => {
  // Настройки доступа (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Нужен POST запрос' });
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return res.status(500).json({ error: 'Переменная MONGODB_URI не найдена в настройках Vercel' });
  }

  const client = new MongoClient(uri);

  try {
    const { item } = req.body;
    
    if (!item || !item.name) {
      return res.status(400).json({ error: 'Данные инструмента пусты или неверны' });
    }

    await client.connect();
    console.log("Успешное подключение к MongoDB");

    const db = client.db('toolmanager'); // Имя базы данных
    const collection = db.collection('inventory'); // Имя коллекции

    const result = await collection.insertOne({
      ...item,
      addedAt: new Date(),
      source: 'AI Scanner'
    });

    console.log("Запись создана:", result.insertedId);
    return res.status(200).json({ success: true, id: result.insertedId });

  } catch (err) {
    console.error("Ошибка при записи в Mongo:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    await client.close();
  }
};