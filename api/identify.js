module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    if (req.method === 'OPTIONS') return res.status(200).end();
  
    try {
      const { image } = req.body;
      if (!image) return res.status(400).json({ error: "Нет фото" });
  
      // Очищаем base64 от префикса (data:image/jpeg;base64,...)
      const base64Data = image.split(',')[1];
  
      // Запрос к AI (Hugging Face)
      const response = await fetch(
        "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base",
        {
          headers: { Authorization: "Bearer hf_XXXXX" }, // Сюда вставь свой токен позже
          method: "POST",
          body: Buffer.from(base64Data, 'base64'),
        }
      );
  
      const result = await response.json();
      // Извлекаем текст описания
      const description = result[0]?.generated_text || "Не удалось распознать";
  
      return res.status(200).json({ success: true, name: description });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  };