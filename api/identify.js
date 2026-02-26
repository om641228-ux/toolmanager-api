const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  // Настройка CORS для связи Netlify и Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ success: false, error: "Фото не получено" });

    // 1. Твой подтвержденный ключ (БЕЗ ПРОБЕЛОВ)
    const genAI = new GoogleGenerativeAI("AIzaSyCQIpoC8NnyOjMvM3kUSUhcHdPG5BLYA5g");
    
    // 2. САМАЯ ПРОДВИНУТАЯ МОДЕЛЬ: Pro версия для глубокого анализа
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const base64Data = image.split(',')[1];
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: "image/jpeg"
      }
    };

    // 3. СПЕЦИАЛЬНЫЙ ПРОМПТ ДЛЯ ГРУППЫ ИНСТРУМЕНТОВ
    const prompt = `Ты — эксперт по инвентаризации склада. На фото может быть несколько разных инструментов. 
    Распознай каждый инструмент и составь нумерованный список на русском языке. 
    Для каждого пункта укажи:
    - Точное название.
    - Его характерную черту (цвет, бренд если видно, или положение на фото).
    Пиши четко и профессионально.`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text().trim();

    return res.status(200).json({ 
      success: true, 
      name: text 
    });

  } catch (err) {
    console.error("Ошибка Pro модели:", err);
    return res.status(500).json({ 
      success: false, 
      name: "Ошибка продвинутой модели: " + err.message 
    });
  }
};