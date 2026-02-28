const { MongoClient } = require('mongodb');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const uri = process.env.MONGODB_URI;

  // 1. Проверяем, видит ли вообще Vercel твою переменную
  if (!uri) {
    return res.status(500).json({ success: false, error: "Vercel не видит переменную MONGODB_URI. Проверь настройки Env!" });
  }

  const client = new MongoClient(uri.trim());

  try {
    await client.connect();
    const db = client.db('toolmanager');
    const result = await db.collection('inventory').insertOne({
      ...req.body.item,
      addedAt: new Date()
    });
    return res.status(200).json({ success: true, id: result.insertedId });
  } catch (err) {
    // 2. Возвращаем РЕАЛЬНУЮ причину ошибки (пароль, IP или формат)
    console.error("Mongo Error:", err.message);
    return res.status(500).json({ success: false, error: "Ошибка базы: " + err.message });
  } finally {
    await client.close();
  }
};