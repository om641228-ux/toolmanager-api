const { MongoClient } = require('mongodb');

// Твоя строка с замененными ! на %21
const uri = "mongodb+srv://oleg:MMA38%21%21%21MVM37%21%21%21@toolmanager.eqbcjbw.mongodb.net/?retryWrites=true&w=majority";

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