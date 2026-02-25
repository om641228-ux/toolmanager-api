module.exports = async (req, res) => {
    // Настройка CORS вручную (чтобы браузер не блокировал)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    // Ответ на предварительную проверку браузера
    if (req.method === 'OPTIONS') return res.status(200).end();
  
    try {
      const { image } = req.body;
      if (!image) return res.status(400).json({ success: false, error: "Нет данных" });
  
      // ТЕСТОВЫЙ ОТВЕТ: Если ты увидишь это на сайте, значит связь ЕСТЬ
      return res.status(200).json({ 
        success: true, 
        name: "Связь с сервером установлена! Инструмент в очереди." 
      });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  };