require('dotenv').config();

module.exports = {
  // OpenAI API 配置
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,

  // Kling AI API 配置（备用）
  KLING_ACCESS_KEY: process.env.KLING_ACCESS_KEY,
  KLING_SECRET_KEY: process.env.KLING_SECRET_KEY,
  KLING_API_URL: process.env.KLING_API_URL || 'https://api.klingai.com',

  // 服务器配置
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development'
}; 