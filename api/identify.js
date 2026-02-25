module.exports = async (req, res) => {
    // Настройка CORS для Netlify
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    if (req.method === 'OPTIONS') return res.status(200).end();
  
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ success: false, error: "Нет фото" });
      }
  
      // Тестовый ответ (позже заменим на вызов AI)
      return res.status(200).json({ 
        success: true, 
        name: "Инструмент определен (Связь ОК)" 
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: "Ошибка сервера" });
    }
  };