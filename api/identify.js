export default function handler(req, res) {
    // Настройка заголовков для обхода CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    // Обработка предварительного запроса браузера
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
  
    // Простейший ответ для теста
    return res.status(200).json({ 
      success: true, 
      message: "Сервер работает! Мы победили 404 и 500." 
    });
  }