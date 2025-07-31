// Recraft图片生成服务
export const generateImage = async (prompt) => {
  try {
    // TODO: 替换为实际的Recraft API调用
    const response = await fetch('https://external.api.recraft.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RECRAFT_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: prompt,
        style: 'digital_illustration',
        model: 'recraftv3',
        n: 1,
      }),
    });

    const data = await response.json();
    return data.data[0].url;
  } catch (error) {
    console.error('图片生成失败:', error);
    // 返回模拟图片URL
    return 'https://via.placeholder.com/300x300/4A90E2/FFFFFF?text=Generated+Image';
  }
}; 