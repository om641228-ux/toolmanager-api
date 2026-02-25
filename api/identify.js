module.exports = async (req, res) => {
    // Настройка CORS вручную
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const { image } = req.body;
        if (!image) return res.status(400).json({ success: false, error: "No image provided" });

        // Пока что возвращаем тестовый ответ, чтобы проверить СВЯЗЬ
        return res.status(200).json({ 
            success: true, 
            name: "Инструмент распознан (Связь ОК!)" 
        });
    } catch (e) {
        return res.status(500).json({ success: false, error: e.message });
    }
};