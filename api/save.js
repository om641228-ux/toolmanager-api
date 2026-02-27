const { MongoClient } = require('mongodb');

module.exports = async (req, res) => {
  // Настройка CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return res.status(500).json({ success: false, error: "MONGODB_URI не настроен в Vercel" });
  }

  // Создаем клиент один раз вне try/catch для стабильности
  const client = new MongoClient(uri, {
    connectTimeoutMS: 5000,
    socketTimeoutMS: 5000,
  });

  try {
    const { item } = req.body;
    if (!item) throw new Error("Нет данных для сохранения (item is empty)");

    await client.connect();
    const db = client.db('toolmanager');
    const collection = db.collection('inventory');

    // Сама запись
    const result = await collection.insertOne({
      ...item,
      addedAt: new Date()
    });

    return res.status(200).json({ success: true, id: result.insertedId });

  } catch (err) {
    console.error("Ошибка MongoDB:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    await client.close();
  }
};