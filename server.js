const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const OpenAI = require('openai');
const multer = require('multer');
const config = require('./config');
const promptManager = require('./prompt-manager');

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
  apiKey: config.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // 允许在浏览器中使用
});

// 验证API Key格式
function validateApiKey(apiKey) {
  if (!apiKey) {
    return { valid: false, error: 'API Key未设置' };
  }
  
  // 检查API Key格式
  if (!apiKey.startsWith('sk-')) {
    return { valid: false, error: 'API Key格式不正确，应以sk-开头' };
  }
  
  // 检查API Key长度
  if (apiKey.length < 20) {
    return { valid: false, error: 'API Key长度不正确' };
  }
  
  return { valid: true };
}

// 静态文件服务
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 智能文本分割函数
function smartTextSplit(text) {
  // 1. 先按句号分割
  let sentences = text.split(/[。！？]/).filter(s => s.trim().length > 0);
  
  // 2. 如果句子太长，再按逗号分割
  let words = [];
  sentences.forEach(sentence => {
    if (sentence.length > 10) {
      // 长句子按逗号分割
      const parts = sentence.split(/[，；：]/).filter(p => p.trim().length > 0);
      words.push(...parts);
    } else {
      // 短句子直接添加
      words.push(sentence);
    }
  });
  
  // 3. 过滤空字符串和太短的词
  words = words.filter(word => word.trim().length > 1);
  
  // 4. 如果还是太少，按字符分割
  if (words.length < 5) {
    const chars = text.split('').filter(char => char.trim().length > 0 && !/[\s\n，。！？；：""''（）【】]/.test(char));
    // 每2-3个字符组成一个词
    const charWords = [];
    for (let i = 0; i < chars.length; i += 2) {
      if (i + 1 < chars.length) {
        charWords.push(chars[i] + chars[i + 1]);
      } else {
        charWords.push(chars[i]);
      }
    }
    words = charWords;
  }
  
  return words;
}

// API路由

// 1. 文本生成诗歌
app.post('/api/generate-poetry', async (req, res) => {
  try {
    const { mood } = req.body;
    
    if (!mood) {
      return res.status(400).json({ error: '请提供心情描述' });
    }

    // 验证API Key
    const apiKeyValidation = validateApiKey(config.OPENAI_API_KEY);
    if (!apiKeyValidation.valid) {
      console.error('API Key验证失败:', apiKeyValidation.error);
      return res.status(500).json({ 
        error: 'API Key配置错误: ' + apiKeyValidation.error,
        details: '请检查Railway环境变量中的OPENAI_API_KEY设置'
      });
    }

    console.log('🔑 API Key验证通过，开始生成诗歌...');
    console.log('📝 用户心情:', mood);

    // 使用prompt管理器获取诗歌生成prompt
    const poetryPrompt = promptManager.getPoetryPrompt(mood);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: poetryPrompt.system
        },
        {
          role: "user",
          content: poetryPrompt.user
        }
      ],
      max_tokens: 500,
      temperature: 0.8
    });

    const poetry = completion.choices[0].message.content;
    
    // 使用智能文本分割
    const words = smartTextSplit(poetry);
    console.log('🎯 智能分词结果:', words);
    
    res.json({ 
      success: true, 
      poetry: poetry,
      words: words,
      mood: mood
    });
    
  } catch (error) {
    console.error('生成诗歌错误:', error);
    
    // 详细的错误信息
    let errorMessage = '生成诗歌失败';
    if (error.code === 'APIConnectionError') {
      errorMessage = '网络连接错误，请检查网络连接';
    } else if (error.code === 'APIAuthenticationError') {
      errorMessage = 'API认证失败，请检查API Key';
    } else if (error.code === 'APIPermissionError') {
      errorMessage = 'API权限不足';
    } else if (error.code === 'APIRateLimitError') {
      errorMessage = 'API请求频率过高，请稍后重试';
    } else if (error.code === 'APIQuotaError') {
      errorMessage = 'API配额已用完';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: error.message,
      code: error.code
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

// 3. 生成图片（OpenAI DALL-E + Kling AI备用）
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, poetry } = req.body;
    
    console.log('收到图片生成请求:', { prompt, poetry });
    console.log('prompt存在:', !!prompt);
    console.log('poetry存在:', !!poetry);
    
    // 修复验证逻辑：只要有poetry或prompt其中一个就可以
    if (!prompt && !poetry) {
      console.log('验证失败：既没有prompt也没有poetry');
      return res.status(400).json({ error: '请提供图片描述或诗歌内容' });
    }

    // 如果没有提供prompt，根据诗歌生成
    let imagePrompt = prompt;
    if (!imagePrompt && poetry) {
      console.log('使用诗歌生成图片提示词');
      // 先翻译诗歌为英文
      const translatedPoetry = await translatePoetryToEnglish(poetry);
      // 使用prompt管理器获取图片生成prompt
      imagePrompt = promptManager.getImagePrompt(translatedPoetry, 'universal');
    }

    console.log('生成的图片提示词:', imagePrompt);

    // 尝试OpenAI，如果失败则使用Kling AI
    let imageUrl = null;
    let error = null;

    // 首先尝试OpenAI
    if (config.OPENAI_API_KEY && config.OPENAI_API_KEY !== 'your_openai_api_key_here') {
      try {
        console.log('尝试使用OpenAI生成图片...');
        const response = await openai.images.generate({
          model: "gpt-image-1", // 使用OpenAI最新最先进的图片生成模型
          prompt: imagePrompt,
          n: 1,
          size: "1024x1024",
          quality: "high" // gpt-image-1支持：low, medium, high, auto
        });

        // 处理响应
        if (response.data[0].b64_json) {
          // 将base64转换为data URL
          imageUrl = `data:image/png;base64,${response.data[0].b64_json}`;
          console.log('OpenAI API响应成功: base64格式');
        } else if (response.data[0].url) {
          // 如果返回的是URL格式
          imageUrl = response.data[0].url;
          console.log('OpenAI API响应成功: URL格式');
        } else {
          throw new Error('OpenAI API返回格式异常');
        }
      } catch (openaiError) {
        console.error('OpenAI API失败:', openaiError.message);
        error = openaiError;
      }
    }

    // 如果OpenAI失败或没有配置，尝试Kling AI
    if (!imageUrl && config.KLING_ACCESS_KEY && config.KLING_SECRET_KEY && 
        config.KLING_ACCESS_KEY !== 'your_kling_access_key_here' && 
        config.KLING_SECRET_KEY !== 'your_kling_secret_key_here') {
      try {
        console.log('尝试使用Kling AI生成图片...');
        imageUrl = await generateImageWithKlingAI(imagePrompt);
        console.log('Kling AI API响应成功:', imageUrl);
      } catch (klingError) {
        console.error('Kling AI API失败:', klingError.message);
        error = klingError;
      }
    }

    if (imageUrl) {
      res.json({ 
        success: true, 
        imageUrl: imageUrl,
        prompt: imagePrompt
      });
    } else {
      throw error || new Error('所有图片生成服务都失败了');
    }

  } catch (error) {
    console.error('生成图片错误:', error);
    res.status(500).json({ 
      error: '生成图片失败',
      details: error.message 
    });
  }
});

// 翻译诗歌为英文
async function translatePoetryToEnglish(poetry) {
  try {
    if (!config.OPENAI_API_KEY || config.OPENAI_API_KEY === 'your_openai_api_key_here') {
      // 如果没有OpenAI API，使用简单的关键词翻译
      return translatePoetryKeywords(poetry);
    }

    // 使用prompt管理器获取翻译prompt
    const translationPrompt = promptManager.getTranslationPrompt(poetry);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // 翻译模型继续使用gpt-3.5-turbo
      messages: [
        {
          role: "system",
          content: translationPrompt.system
        },
        {
          role: "user",
          content: translationPrompt.user
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('翻译失败:', error);
    // 如果翻译失败，使用关键词翻译
    return translatePoetryKeywords(poetry);
  }
}

// 简单的关键词翻译
function translatePoetryKeywords(poetry) {
  const keywordMap = {
    '云': 'clouds',
    '天空': 'sky',
    '梦境': 'dreams',
    '星辰': 'stars',
    '时光': 'time',
    '情感': 'emotions',
    '宇宙': 'universe',
    '灵魂': 'soul',
    '心': 'heart',
    '梦': 'dream',
    '光': 'light',
    '影': 'shadow',
    '海': 'sea',
    '风': 'wind',
    '雨': 'rain',
    '雪': 'snow',
    '花': 'flowers',
    '月': 'moon',
    '日': 'sun',
    '夜': 'night',
    '疲惫': 'weary',
    '孤独': 'lonely',
    '宁静': 'serene',
    '温柔': 'gentle',
    '深邃': 'deep',
    '飘渺': 'ethereal',
    '空灵': 'ethereal',
    '梦幻': 'dreamy',
    '清新': 'fresh',
    '纯净': 'pure'
  };

  let translated = poetry;
  for (const [chinese, english] of Object.entries(keywordMap)) {
    translated = translated.replace(new RegExp(chinese, 'g'), english);
  }

  return translated || 'dreamy clouds and ethereal atmosphere';
}

// Kling AI图片生成函数
async function generateImageWithKlingAI(prompt) {
  const crypto = require('crypto');
  
  // 生成时间戳
  const timestamp = Math.floor(Date.now() / 1000);
  
  // 生成签名
  const message = `${config.KLING_ACCESS_KEY}${timestamp}`;
  const signature = crypto.createHmac('sha256', config.KLING_SECRET_KEY)
    .update(message)
    .digest('hex');

  // 创建任务
  const createResponse = await fetch(`${config.KLING_API_URL}/v1/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.KLING_ACCESS_KEY}`,
      'X-Timestamp': timestamp.toString(),
      'X-Signature': signature
    },
    body: JSON.stringify({
      model_name: 'kling-v1', // 使用kling-v1模型
      prompt: prompt,
      n: 1,
      aspect_ratio: '1:1' // 1024x1024对应1:1比例
    })
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    throw new Error(`Kling AI API error: ${createResponse.status} - ${errorText}`);
  }

  const createData = await createResponse.json();
  console.log('Kling AI创建任务响应:', createData);

  if (createData.code !== 0) {
    throw new Error(`Kling AI创建任务失败: ${createData.message}`);
  }

  const taskId = createData.data.task_id;
  console.log('Kling AI任务ID:', taskId);

  // 轮询查询任务状态
  let attempts = 0;
  const maxAttempts = 60; // 最多等待60次（约5分钟）
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // 等待5秒
    
    const queryResponse = await fetch(`${config.KLING_API_URL}/v1/images/generations/${taskId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.KLING_ACCESS_KEY}`,
        'X-Timestamp': timestamp.toString(),
        'X-Signature': signature
      }
    });

    if (!queryResponse.ok) {
      const errorText = await queryResponse.text();
      throw new Error(`Kling AI查询任务错误: ${queryResponse.status} - ${errorText}`);
    }

    const queryData = await queryResponse.json();
    console.log('Kling AI查询任务响应:', queryData);

    if (queryData.code !== 0) {
      throw new Error(`Kling AI查询任务失败: ${queryData.message}`);
    }

    const taskStatus = queryData.data.task_status;
    console.log('Kling AI任务状态:', taskStatus);

    if (taskStatus === 'succeed') {
      // 任务成功，返回图片URL
      const imageUrl = queryData.data.task_result.images[0].url;
      console.log('Kling AI生成图片成功:', imageUrl);
      return imageUrl;
    } else if (taskStatus === 'failed') {
      throw new Error(`Kling AI任务失败: ${queryData.data.task_status_msg || '未知错误'}`);
    } else if (taskStatus === 'submitted' || taskStatus === 'processing') {
      // 继续等待
      attempts++;
      continue;
    } else {
      throw new Error(`Kling AI未知任务状态: ${taskStatus}`);
    }
  }

  throw new Error('Kling AI任务超时');
}

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📝 API文档:`);
  console.log(`   - POST /api/generate-poetry - 生成诗歌`);
  console.log(`   - POST /api/speech-to-text - 语音转文字`);
  console.log(`   - POST /api/generate-image - 生成图片`);
  console.log(`🔧 环境: ${config.NODE_ENV}`);
  console.log(`⚠️  请确保在.env文件中设置了正确的API密钥`);
  console.log(`✨ 使用智能文本分割替代jieba分词`);
  console.log(`🎨 使用统一prompt管理`);
});