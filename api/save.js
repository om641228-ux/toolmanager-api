const { MongoClient } = require('mongodb');

module.exports = async (req, res) => {
  // CORS заголовки
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // 1. ПОЛУЧАЕМ И ОЧИЩАЕМ СТРОКУ
  let uri = process.env.MONGODB_URI;

  if (!uri) {
    return res.status(500).json({ error: "Переменная MONGODB_URI не найдена в Vercel!" });
  }

  // Убираем всё лишнее: кавычки, пробелы и возможный префикс 'MONGODB_URI='
  uri = uri.trim().replace(/^MONGODB_URI=/, '').replace(/['"]/g, '');

  // Проверяем формат еще раз
  if (!uri.startsWith("mongodb+srv://") && !uri.startsWith("mongodb://")) {
    return res.status(500).json({ error: "Ошибка формата: ссылка должна начинаться с mongodb+srv://" });
  }

  const client = new MongoClient(uri);

  try {
    const { item } = req.body;
    await client.connect();
    
    const db = client.db('toolmanager');
    const result = await db.collection('inventory').insertOne({
      ...item,
      addedAt: new Date()
    });

    return res.status(200).json({ success: true, id: result.insertedId });
  } catch (err) {
    return res.status(500).json({ error: "Ошибка подключения к базе: " + err.message });
  } finally {
    await client.close();
  }
};