module.exports = async (req, res) => {
    // Ручная настройка CORS для стабильности
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({ success: false, error: "Нет изображения" });
        }

        // Тестовое распознавание
        return res.status(200).json({ 
            success: true, 
            name: "Инструмент (Связь с AI установлена)" 
        });
    } catch (e) {
        return res.status(500).json({ success: false, error: e.message });
    }
};