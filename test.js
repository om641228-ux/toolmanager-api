const { MongoClient } = require('mongodb');

// Твоя проверенная строка из настроек Vercel
const uri = "mongodb+srv://admin:MMAMVM@cluster0.jt4tijh.mongodb.net/toolmanager?retryWrites=true&w=majority";

async function run() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log("🚀 СОЕДИНЕНИЕ УСТАНОВЛЕНО!");
        const db = client.db("test");
        const tools = await db.collection("tools").find().toArray();
        console.log("📦 НАЙДЕНО ИНСТРУМЕНТОВ В БАЗЕ:", tools.length);
        console.log("ПОСЛЕДНИЙ ДОБАВЛЕННЫЙ:", tools[tools.length - 1]?.name || "Пусто");
    } catch (err) {
        console.error("❌ ОШИБКА:", err);
    } finally {
        await client.close();
    }
}
run();