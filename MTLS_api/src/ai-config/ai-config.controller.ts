import OpenAI from "openai";

  // Endpoint để lấy cấu hình
export const getAIConfig = (req, res) => {
  // Chỉ trả về thông tin có thể hiển thị cho client
  // Không trả về API key đầy đủ vì lý do bảo mật
  res.json({
    openaiApiKey: process.env.OPENAI_API_KEY ? '••••••••' + process.env.OPENAI_API_KEY.slice(-4) : '',
    openaiModel: process.env.OPENAI_MODEL || 'gpt-4o',
    activeProvider: 'openai',
  });
};

// Endpoint để cập nhật cấu hình
export const updateAIConfig = async (req, res) => {
  try {
    const { openaiApiKey, openaiModel } = req.body;

    // Cập nhật biến môi trường (lưu ý: điều này không thay đổi file .env)
    // Bạn cần sử dụng một giải pháp như dotenv-flow để cập nhật file .env
    process.env.OPENAI_API_KEY = openaiApiKey;
    process.env.OPENAI_MODEL = openaiModel;

    // Lưu cấu hình vào database nếu cần
    // await saveConfigToDatabase(openaiApiKey, openaiModel);

    res.json({ success: true, message: 'AI configuration updated successfully' });
  } catch (error) {
    console.error('Error updating AI config:', error);
    res.status(500).json({ success: false, error: 'Failed to update AI configuration' });
  }
};

export const testOpenAIConnection = async (req, res) => {
  try {
    // Sử dụng API key từ biến môi trường hoặc từ request (nếu được cung cấp)
    const apiKey = req.body.apiKey || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    // Kiểm tra kết nối với OpenAI
    const openai = new OpenAI({ apiKey });
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 5
    });

    if (response) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Failed to connect to OpenAI' });
    }
  } catch (error) {
    console.error('Error testing OpenAI connection:', error);
    res.status(400).json({ error: error.message });
  }
};