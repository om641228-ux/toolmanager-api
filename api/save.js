const { MongoClient } = require('mongodb');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    const { item } = req.body;
    await client.connect();
    const db = client.db('toolmanager');
    await db.collection('inventory').insertOne({ ...item, date: new Date() });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await client.close();
  }
};