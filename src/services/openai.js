// OpenAI诗歌生成服务
export const generatePoetry = async (mood) => {
  try {
    // TODO: 替换为实际的OpenAI API调用
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一个富有诗意的AI助手，根据用户的心情创作优美的中文诗歌。'
          },
          {
            role: 'user',
            content: `请根据以下心情创作一首诗：${mood}`
          }
        ],
        max_tokens: 200,
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('诗歌生成失败:', error);
    // 返回模拟数据
    return '今天心情很好，想分享给朋友，让快乐传递到每个角落。';
  }
}; 