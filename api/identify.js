module.exports = async (req, res) => {
    // Настройка заголовков для связи фронтенда и бэкенда
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    if (req.method === 'OPTIONS') return res.status(200).end();
  
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ success: false, error: "Фото не получено" });
      }
  
      // Твоя локальная база инструментов (можно расширять)
      const catalog = [
        "Болгарка (УШМ) 125мм",
        "Перфоратор сетевой",
        "Набор ключей рожковых",
        "Лобзик ручной",
        "Шуруповерт аккумуляторный"
      ];
  
      // Выбираем случайный инструмент (имитация распознавания твоим движком)
      const identifiedTool = catalog[Math.floor(Math.random() * catalog.length)];
  
      return res.status(200).json({ 
        success: true, 
        name: identifiedTool 
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: "Ошибка на сервере" });
    }
  };