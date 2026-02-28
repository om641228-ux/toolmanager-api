const { MongoClient } = require('mongodb');

module.exports = async (req, res) => {
  // Настройка CORS для связи с Netlify
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const uri = process.env.MONGODB_URI;
  if (!uri) return res.status(500).json({ error: "Ошибка: MONGODB_URI не настроен в Vercel" });

  const client = new MongoClient(uri);

  try {
    const { item } = req.body;
    
    // Проверка, что данные не пустые
    if (!item || !item.name) {
      return res.status(400).json({ error: "Неверные данные инструмента" });
    }

    await client.connect();
    
    // Выбираем базу 'toolmanager' и коллекцию 'inventory'
    const db = client.db('toolmanager');
    const collection = db.collection('inventory');

    // Формируем чистый объект для записи
    const toolData = {
      name: item.name,
      brand: item.brand || "Неизвестно",
      condition: item.cond || "Не указано",
      addedAt: new Date(),
    };

    const result = await collection.insertOne(toolData);

    return res.status(200).json({ 
      success: true, 
      id: result.insertedId,
      message: "Инструмент успешно сохранен!" 
    });

  } catch (err) {
    console.error("Ошибка Mongo:", err.message);
    return res.status(500).json({ error: "Ошибка базы данных: " + err.message });
  } finally {
    await client.close();
  }
};