# Cloud Poetry App

一个基于React Native的云朵诗歌创作应用，集成了Three.js云渲染、AI诗歌生成和图片生成功能。

## 功能特性

- 🌥️ **Three.js云渲染** - 实时3D云朵效果
- 💬 **智能对话** - 与云朵分享心情
- 📝 **AI诗歌生成** - 基于OpenAI的诗歌创作
- 🎮 **互动游戏** - 词语掉落点击游戏
- 🖼️ **AI图片生成** - 基于Recraft的图片创作
- 📱 **移动端优化** - iOS优先的触摸体验
- 🔗 **分享功能** - 一键分享到小红书

## 技术栈

- **React Native** - 跨平台移动应用
- **Expo** - 开发工具链
- **Three.js** - 3D云渲染
- **OpenAI API** - 诗歌生成
- **Recraft API** - 图片生成
- **jieba** - 中文分词

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm start
```

### 运行平台

```bash
# iOS
npm run ios

# Android  
npm run android

# Web
npm run web
```

## 项目结构

```
src/
├── components/
│   ├── CloudScene/     # Three.js云渲染
│   ├── ChatInterface/  # 聊天界面
│   ├── PoetryGame/     # 诗歌游戏
│   └── ShareComponent/ # 分享界面
├── services/
│   ├── openai.js       # 诗歌生成
│   ├── recraft.js      # 图片生成
│   └── jieba.js        # 中文分词
└── utils/
    └── ImprovedNoise.js # Three.js工具
```

## 环境变量

创建 `.env` 文件：

```
OPENAI_API_KEY=your_openai_api_key
RECRAFT_API_KEY=your_recraft_api_key
```

## 开发计划

- [x] 项目结构搭建
- [x] Three.js云渲染集成
- [x] 基础UI组件
- [ ] API集成
- [ ] 游戏交互优化
- [ ] 分享功能
- [ ] 性能优化

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT License 