const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const OpenAI = require('openai');
const multer = require('multer');
const config = require('./config');

const app = express();
const PORT = config.PORT;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// 文件上传配置
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// OpenAI 客户端
const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY
});

// 静态文件服务
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API路由

// 1. 文本生成诗歌
app.post('/api/generate-poetry', async (req, res) => {
  try {
    const { mood } = req.body;
    
    if (!mood) {
      return res.status(400).json({ error: '请提供心情描述' });
    }

    if (!config.OPENAI_API_KEY || config.OPENAI_API_KEY === 'your_openai_api_key_here') {
      return res.status(500).json({ error: '请先在.env文件中设置OPENAI_API_KEY' });
    }

    const prompt = `根据用户的心情"${mood}"，创作一首现代中文诗歌。要求：
    1. 诗歌要体现用户的心情和感受，但要有哲学深度
    2. 使用现代诗的格式，语言简洁有力
    3. 融入哲学思考，探讨存在、时间、情感等主题
    4. 要有意象的运用，但不要过于晦涩
    5. 长度适中，4-6句为宜
    6. 体现现代人的情感体验和思考
    7. 可以包含对生活、人性、宇宙的思考
    8. 语言要有诗意，但保持现代感`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "你是一位现代中文诗人，擅长创作富有哲学意味的现代诗。你的诗歌语言简洁有力，意象丰富，常常探讨存在、时间、情感等深层主题。你善于将个人情感与普遍的人性思考相结合，创作出既有个人色彩又有普遍意义的现代诗歌。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.8
    });

    const poetry = completion.choices[0].message.content;
    
    res.json({ 
      success: true, 
      poetry: poetry,
      mood: mood
    });

  } catch (error) {
    console.error('生成诗歌错误:', error);
    res.status(500).json({ 
      error: '生成诗歌失败',
      details: error.message 
    });
  }
});

// 2. 语音转文字
app.post('/api/speech-to-text', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '没有上传音频文件' });
    }

    if (!config.OPENAI_API_KEY || config.OPENAI_API_KEY === 'your_openai_api_key_here') {
      return res.status(500).json({ error: '请先在.env文件中设置OPENAI_API_KEY' });
    }

    // 将音频数据转换为base64
    const audioBuffer = req.file.buffer;
    const base64Audio = audioBuffer.toString('base64');

    const transcription = await openai.audio.transcriptions.create({
      file: Buffer.from(base64Audio, 'base64'),
      model: "whisper-1",
      language: "zh"
    });

    res.json({ 
      success: true, 
      text: transcription.text 
    });

  } catch (error) {
    console.error('语音转文字错误:', error);
    res.status(500).json({ 
      error: '语音转文字失败',
      details: error.message 
    });
  }
});

// 3. 生成图片（Recraft AI）
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: '请提供图片描述' });
    }

    if (!config.RECRAFT_API_KEY || config.RECRAFT_API_KEY === 'your_recraft_api_key_here') {
      return res.status(500).json({ error: '请先在.env文件中设置RECRAFT_API_KEY' });
    }

    // 这里需要集成Recraft AI API
    // 暂时返回模拟数据
    const mockImageUrl = `https://picsum.photos/400/600?random=${Date.now()}`;
    
    res.json({ 
      success: true, 
      imageUrl: mockImageUrl,
      prompt: prompt
    });

  } catch (error) {
    console.error('生成图片错误:', error);
    res.status(500).json({ 
      error: '生成图片失败',
      details: error.message 
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📝 API文档:`);
  console.log(`   - POST /api/generate-poetry - 生成诗歌`);
  console.log(`   - POST /api/speech-to-text - 语音转文字`);
  console.log(`   - POST /api/generate-image - 生成图片`);
  console.log(`🔧 环境: ${config.NODE_ENV}`);
  console.log(`⚠️  请确保在.env文件中设置了正确的API密钥`);
}); 