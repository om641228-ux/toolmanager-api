module.exports = (req, res) => {
    // Заголовки для CORS, чтобы браузер не блокировал запрос
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    // Ответ на предварительную проверку (Preflight)
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
  
    // Если запрос дошел сюда, возвращаем успех
    return res.status(200).json({ 
      success: true, 
      message: "ЕСТЬ КОНТАКТ! Сервер ответил 200 OK." 
    });
  };