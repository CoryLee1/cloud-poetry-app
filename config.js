require('dotenv').config();

module.exports = {
  // OpenAI API 配置
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  
  // Recraft AI API 配置
  RECRAFT_API_KEY: process.env.RECRAFT_API_KEY,
  RECRAFT_API_URL: process.env.RECRAFT_API_URL || 'https://api.recraft.ai/v1',
  
  // 服务器配置
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development'
}; 