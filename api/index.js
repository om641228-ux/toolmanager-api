module.exports = async (req, res) => {
    // Разрешаем браузеру делать запросы (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Просто возвращаем ответ без базы
    return res.status(200).json({
        success: true,
        name: "Ручная пила (Тест связи)"
    });
};