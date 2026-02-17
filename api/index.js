app.post("/api/analyze", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    // Инициализация модели
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Подготовка данных для Google: преобразуем буфер в объект нужного формата
    const imageParts = [
      {
        inlineData: {
          data: req.file.buffer.toString("base64"),
          mimeType: req.file.mimetype // Берем тип (image/jpeg, image/png) прямо из файла
        }
      }
    ];

    const prompt = "Назови инструмент на фото одним словом на русском.";

    // Отправка запроса в Google
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const toolName = response.text().trim();

    // Сохранение в базу (используем ту переменную, что у тебя в настройках)
    const newTool = new Tool({ 
      name: toolName, 
      image: req.file.buffer.toString("base64") 
    });
    await newTool.save();

    res.json({ success: true, toolName, imageData: newTool.image });
  } catch (error) {
    console.error("Google AI Error:", error.message);
    res.status(500).json({ error: "Ошибка ИИ: " + error.message });
  }
});
