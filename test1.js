const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://admin:MMAMVM@cluster0.jt4tijh.mongodb.net/toolmanager?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("🚀 Подключено!");
    
    const db = client.db("toolmanager");
    const result = await db.collection("tools").insertOne({
      name: "ТЕРМИНАЛЬНЫЙ МОЛОТОК",
      category: "проверка",
      date: new Date()
    });

    console.log("✅ ЗАПИСЬ СОЗДАНА! ID:", result.insertedId);
  } catch (err) {
    console.error("❌ ОШИБКА:", err);
  } finally {
    await client.close();
  }
}
run();