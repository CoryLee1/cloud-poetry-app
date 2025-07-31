// jieba分词服务
export const segmentText = (text) => {
  try {
    // TODO: 集成jieba分词库
    // 这里先用简单的空格分词作为占位符
    const words = text.split(/[\s，。！？；：""''（）【】]/).filter(word => word.length > 0);
    return words;
  } catch (error) {
    console.error('分词失败:', error);
    return text.split(' ').filter(word => word.length > 0);
  }
};

// 模拟jieba分词结果
export const mockSegmentText = (text) => {
  const mockWords = [
    '今天', '心情', '很好', '想', '分享', '给', '朋友',
    '快乐', '传递', '到', '每个', '角落', '让', '世界', '充满', '爱'
  ];
  
  // 随机选择一些词语
  const selectedWords = [];
  const textLength = text.length;
  const wordCount = Math.min(Math.floor(textLength / 3), mockWords.length);
  
  for (let i = 0; i < wordCount; i++) {
    const randomIndex = Math.floor(Math.random() * mockWords.length);
    selectedWords.push(mockWords[randomIndex]);
  }
  
  return selectedWords;
}; 