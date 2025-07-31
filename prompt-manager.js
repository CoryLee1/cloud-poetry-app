// Prompt管理器 - 统一管理所有AI服务的prompt模板

class PromptManager {
  constructor() {
    this.templates = {
      // 诗歌生成prompt
      poetry: {
        system: "你是一位现代中文诗人，擅长创作富有哲学意味的现代诗。你的诗歌语言简洁有力，意象丰富，常常探讨存在、时间、情感等深层主题。你善于将个人情感与普遍的人性思考相结合，创作出既有个人色彩又有普遍意义的现代诗歌。",
        user: (mood) => `根据用户的心情"${mood}"，创作一首现代中文诗歌。要求：
1. 诗歌要体现用户的心情和感受，但要有哲学深度
2. 使用现代诗的格式，语言简洁有力
3. 融入哲学思考，探讨存在、时间、情感等主题
4. 要有意象的运用，但不要过于晦涩
5. 长度适中，4-6句为宜
6. 体现现代人的情感体验和思考
7. 可以包含对生活、人性、宇宙的思考
8. 语言要有诗意，但保持现代感`
      },

      // 诗歌翻译prompt
      translation: {
        system: "你是一个专业的诗歌翻译专家。请将中文诗歌翻译成优美的英文，并提取其中的视觉意象和情感色彩，适合作为AI图片生成的提示词。翻译要简洁、优雅，突出视觉元素，并融入dreamcore、夏日、清新、宁静、电影感、摄影感等关键词。",
        user: (poetry) => `请将以下中文诗歌翻译成英文，并提取视觉意象，使其适合生成一张具有"很美、很安静、电影感、摄影感、清新的dreamcore夏日fuji摄影文艺风格"的图片，图片中不能出现任何文字。\n\n${poetry}`
      },

      // 图片生成prompt模板
      imageGeneration: {
        // OpenAI DALL-E / GPT-Image-1 模板
        openai: (translatedPoetry) => `a poetic cinematic photo of water and light, reflecting on translucent surfaces with sparkling highlights, clean atmosphere, soft natural color grading, dreamy and minimal, with floating elements like bubbles, petals or butterflies, in the style of a Japanese indie film, highly detailed, shot on 50mm f/1.4 lens, Fujifilm Pro 400H color palette, bokeh, overexposed sunlight, shallow depth of field, melancholic but peaceful. Inspired by the poem: "${translatedPoetry}"`,
        
        // Kling AI 模板
        kling: (translatedPoetry) => `a poetic cinematic photo of water and light, reflecting on translucent surfaces with sparkling highlights, clean atmosphere, soft natural color grading, dreamy and minimal, with floating elements like bubbles, petals or butterflies, in the style of a Japanese indie film, highly detailed, shot on 50mm f/1.4 lens, Fujifilm Pro 400H color palette, bokeh, overexposed sunlight, shallow depth of field, melancholic but peaceful. Inspired by the poem: "${translatedPoetry}"`,
        
        // 通用模板
        universal: (translatedPoetry) => `a poetic cinematic photo of water and light, reflecting on translucent surfaces with sparkling highlights, clean atmosphere, soft natural color grading, dreamy and minimal, with floating elements like bubbles, petals or butterflies, in the style of a Japanese indie film, highly detailed, shot on 50mm f/1.4 lens, Fujifilm Pro 400H color palette, bokeh, overexposed sunlight, shallow depth of field, melancholic but peaceful. Inspired by the poem: "${translatedPoetry}"`
      },

      // 风格关键词
      styles: {
        dreamcore: ['dreamy', 'ethereal', 'surreal', 'otherworldly', 'dreamcore'],
        summer: ['summer', 'warm', 'bright', 'vibrant', 'luminous'],
        fuji: ['fuji photography', 'artistic', 'cinematic', 'photographic'],
        fresh: ['fresh', 'clean', 'pure', 'crisp', 'bright'],
        quiet: ['serene', 'peaceful', 'tranquil', 'calm', 'quiet'],
        cinematic: ['cinematic', 'dramatic', 'filmic', 'movie-like'],
        noText: ['no text', 'no words', 'pure visual art', 'no typography']
      }
    };
  }

  // 获取诗歌生成prompt
  getPoetryPrompt(mood) {
    return {
      system: this.templates.poetry.system,
      user: this.templates.poetry.user(mood)
    };
  }

  // 获取诗歌翻译prompt
  getTranslationPrompt(poetry) {
    return {
      system: this.templates.translation.system,
      user: this.templates.translation.user(poetry)
    };
  }

  // 获取图片生成prompt
  getImagePrompt(translatedPoetry, service = 'universal') {
    const template = this.templates.imageGeneration[service] || this.templates.imageGeneration.universal;
    return template(translatedPoetry);
  }

  // 获取风格关键词
  getStyleKeywords() {
    return this.templates.styles;
  }

  // 构建自定义prompt
  buildCustomPrompt(basePrompt, styleKeywords = []) {
    const keywords = styleKeywords.join(', ');
    return `${basePrompt} ${keywords}`;
  }

  // 验证prompt长度
  validatePromptLength(prompt, maxLength = 2500) {
    return prompt.length <= maxLength;
  }

  // 清理prompt（移除多余空格等）
  cleanPrompt(prompt) {
    return prompt.replace(/\s+/g, ' ').trim();
  }
}

// 导出PromptManager实例
module.exports = new PromptManager(); 