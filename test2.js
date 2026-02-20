const { MongoClient } = require('mongodb');

// Твоя строка подключения
const uri = "mongodb+srv://admin:MMAMVM@cluster0.jt4tijh.mongodb.net/toolmanager?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function main() {
    const action = process.argv[2]; // 'add' или 'show'
    const name = process.argv[3];   // Название
    const cat = process.argv[4];    // Категория

    try {
        await client.connect();
        // ВАЖНО: Подключаемся именно к 'toolmanager' и 'tools'
        const db = client.db("toolmanager");
        const collection = db.collection("tools");

        if (action === 'add' && name) {
            // ЗАПИСЬ В БАЗУ
            await collection.insertOne({
                name: name,
                category: cat || "Ручной",
                date: new Date(),
                image: "", 
                isAI: false
            });
            console.log(`✅ Инструмент "${name}" успешно записан в основной склад!`);
        } 
        else if (action === 'show') {
            // ВЫВОД ВСЕГО СКЛАДА
            const tools = await collection.find().toArray();
            console.log(`\n📦 ПОЛНЫЙ СКЛАД (Найдено: ${tools.length} шт.)`);
            console.table(tools.map(t => ({
                "Название": t.name,
                "Категория": t.category || "---",
                "Дата": t.date ? new Date(t.date).toLocaleDateString() : "---"
            })));
        } 
        else {
            console.log("Использование:\n node db_tool.js show\n node db_tool.js add 'Имя' 'Категория'");
        }
    } finally {
        await client.close();
    }
}
main();