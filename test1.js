const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://admin:MMAMVM@cluster0.jt4tijh.mongodb.net/toolmanager?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        // Подключаемся к правильной базе и коллекции
        const db = client.db("toolmanager");
        const tools = await db.collection("tools").find().toArray();

        console.log("\n📦 ПОЛНЫЙ СПИСОК СКЛАДА (Найдено: " + tools.length + " шт.)");
        console.log("---------------------------------------------------------");

        const tableData = tools.map(t => ({
            "Название": t.name,
            "Категория": t.category || "---",
            "Дата": t.date ? new Date(t.date).toLocaleDateString('ru-RU') : "---",
            "ИИ": t.isAI ? "✅" : "❌"
        }));

        console.table(tableData);

    } catch (e) {
        console.error("Ошибка:", e);
    } finally {
        await client.close();
    }
}
run();