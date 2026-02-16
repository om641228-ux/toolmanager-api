const { MongoClient } = require('mongodb');

// 
const uri = "mongodb+srv://oleg:MMA38IMVM37O@toolmanager.eqbcjbw.mongodb.net/?retryWrites=true&w=majority";

async function run() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log("УРА! Подключение к MongoDB успешно!");
    } catch (e) {
        console.error("ОШИБКА ПОДКЛЮЧЕНИЯ:", e.message);
    } finally {
        await client.close();
    }
}
run();