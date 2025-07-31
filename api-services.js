// API服务 - 图片生成功能
class ImageGenerationService {
    constructor() {
        this.baseUrl = 'https://external.api.recraft.ai/v1';
    }

    // 生成图片
    async generateImage(prompt, style = 'digital_illustration', size = '1024x1024') {
        try {
            const response = await fetch(`${this.baseUrl}/images/generations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getApiKey()}`
                },
                body: JSON.stringify({
                    prompt: prompt,
                    style: style,
                    size: size,
                    n: 1,
                    model: 'recraftv3',
                    response_format: 'url'
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                imageUrl: data.data[0].url,
                prompt: prompt
            };
        } catch (error) {
            console.error('图片生成失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 获取API密钥
    getApiKey() {
        // 从环境变量或配置中获取
        return process.env.RECRAFT_API_KEY || 'your_recraft_api_key_here';
    }

    // 根据诗歌内容生成图片提示词
    generatePromptFromPoetry(poetry) {
        // 简单的提示词生成逻辑
        const keywords = this.extractKeywords(poetry);
        return `A dreamy, ethereal cloud landscape with ${keywords.join(', ')} in soft, pastel colors, digital art style, mobile phone wallpaper, 1024x1024`;
    }

    // 从诗歌中提取关键词
    extractKeywords(poetry) {
        // 简单的关键词提取
        const commonKeywords = ['云', '天空', '梦境', '星辰', '时光', '情感', '宇宙', '灵魂'];
        const foundKeywords = commonKeywords.filter(keyword => poetry.includes(keyword));
        
        if (foundKeywords.length > 0) {
            return foundKeywords.slice(0, 3); // 最多取3个关键词
        }
        
        return ['dreamy clouds', 'ethereal atmosphere', 'soft lighting'];
    }
}

// 导出服务
window.ImageGenerationService = ImageGenerationService; 