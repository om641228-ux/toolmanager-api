module.exports = async (req, res) => {
    // 1. Настройка CORS (разрешаем запросы с Netlify)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    // 2. Обработка префлайт-запроса браузера
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
  
    // 3. Основная логика
    try {
      if (req.method === 'POST') {
        const { image, save } = req.body;
  
        if (!image) {
          return res.status(400).json({ success: false, error: "Нет данных изображения" });
        }
  
        // Если нажата кнопка "Сохранить"
        if (save) {
          return res.status(200).json({ success: true, message: "Сохранено в базу (имитация)" });
        }
  
        // Имитация работы AI (чтобы фронтенд не падал)
        return res.status(200).json({ 
          success: true, 
          name: "Садовые ножницы (AI определил)" 
        });
      }
  
      return res.status(405).json({ error: "Метод не разрешен" });
    } catch (err) {
      // Гарантируем, что вернется JSON, а не HTML-ошибка
      return res.status(500).json({ success: false, error: err.message });
    }
  };