const { MongoClient } = require('mongodb');

module.exports = async (req, res) => {
  // Настройка CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // 1. ПРОВЕРКА ССЫЛКИ
  const uri = process.env.MONGODB_URI ? process.env.MONGODB_URI.trim() : null;

  if (!uri) {
    return res.status(500).json({ 
      success: false, 
      error: "Ошибка: Переменная MONGODB_URI не найдена в настройках Vercel!" 
    });
  }

  // Если ссылка начинается не так, как надо
  if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
    return res.status(500).json({ 
      success: false, 
      error: "Ошибка: Ссылка в MONGODB_URI должна начинаться с mongodb+srv://" 
    });
  }

  const client = new MongoClient(uri);

  try {
    const { item } = req.body;
    await client.connect();
    const db = client.db('toolmanager');
    const collection = db.collection('inventory');

    const result = await collection.insertOne({ ...item, addedAt: new Date() });
    return res.status(200).json({ success: true, id: result.insertedId });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Ошибка базы: " + err.message });
  } finally {
    await client.close();
  }
};