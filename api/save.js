const { MongoClient } = require('mongodb');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // 1. Извлекаем и ЧИСТИМ ссылку от пробелов/кавычек
  const rawUri = process.env.MONGODB_URI;
  const uri = rawUri ? rawUri.trim().replace(/['"]/g, '') : null;

  if (!uri) {
    return res.status(500).json({ 
      success: false, 
      error: "Переменная MONGODB_URI не найдена! Проверь Settings в Vercel." 
    });
  }

  // 2. Проверка формата (чтобы не упало с той же ошибкой)
  if (!uri.startsWith("mongodb+srv://") && !uri.startsWith("mongodb://")) {
    return res.status(500).json({ 
      success: false, 
      error: "Ошибка: Ссылка в Vercel начинается неверно. Должна быть с 'mongodb+srv://'" 
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
    return res.status(500).json({ success: false, error: "Ошибка MongoDB: " + err.message });
  } finally {
    await client.close();
  }
};