const { MongoClient } = require('mongodb');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    const { item } = req.body; // Получаем данные от кнопки "Добавить"
    await client.connect();
    const db = client.db('toolmanager');
    const collection = db.collection('inventory');

    // Добавляем дату и сохраняем
    const result = await collection.insertOne({
      ...item,
      addedAt: new Date()
    });

    return res.status(200).json({ success: true, id: result.insertedId });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  } finally {
    await client.close();
  }
};