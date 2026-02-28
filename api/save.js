const { MongoClient } = require('mongodb');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Чистим ссылку от мусора, если он залетел
  const uri = process.env.MONGODB_URI ? process.env.MONGODB_URI.trim().replace(/['"]/g, '') : null;

  if (!uri || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) {
    return res.status(500).json({ 
      success: false, 
      error: `Критическая ошибка: URI базы неверный или пустой. Проверь Vercel!` 
    });
  }

  const client = new MongoClient(uri);

  try {
    const { item } = req.body;
    await client.connect();
    const db = client.db('toolmanager');
    const collection = db.collection('inventory');

    const result = await collection.insertOne({
      ...item,
      addedAt: new Date()
    });

    return res.status(200).json({ success: true, id: result.insertedId });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Ошибка Mongo: " + err.message });
  } finally {
    await client.close();
  }
};