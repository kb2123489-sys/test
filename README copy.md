# NetPulse: 网络脉动

## 🌏 简介

**NetPulse: 网络脉动** 是一款基于搜索增强生成的智能互联网事件分析器。它能将零散的网络信息转化为结构化的深度洞察，为重大的科技与互联网事件提供实时摘要、核心影响分析以及历史镜像对比。
<p align="center">
  <img src="locales/PixPin.png" alt="NetPulse 界面预览" width="100%">
  <img src="locales/PixPin2.png" alt="NetPulse 界面预览" width="100%">
</p>


**架构升级**: 本项目现已采用基于 **阿里云** 的 **BFF (Backend-for-Frontend)** 架构。所有的 API 调用（Tavily 搜索和 Gemini 分析）均在服务端安全执行，彻底杜绝了 API Key 在前端泄露的风险。

#阿里云ESA Pages #阿里云云工开物

本项目是**阿里云 ESA (Edge Security Acceleration) 边缘计算创新大赛**的创意参赛作品。
借助 **阿里云 ESA** 强大的边缘计算能力，我们将这个富交互的静态网站分发到全球节点，确保用户在世界任何角落都能体验到闪电般的加载速度。


## ✨ 核心功能

- **双语支持**：完整的国际化 (i18n) 支持，中英文界面自由切换，API 响应也会根据语言自动调整。
- **搜索增强 (RAG)**：集成 **Tavily API** 获取实时、准确的网络上下文，大幅降低大模型幻觉。
- **双模式分析**：
  - **快速模式** (~15秒)：使用 Gemini 3.0 Flash 快速扫描
  - **深度模式** (~60秒)：使用 Gemini 3.0 Pro 深度分析
- **自定义 API Key**：高级用户可配置自己的搜索服务（Tavily/Exa）和大模型服务（Gemini/DeepSeek/OpenAI/Claude 或自定义端点）的 API Key。
- **历史回响**：独创功能，自动将当前事件与历史上的类似事件进行对比，寻找历史的韵脚。
- **分享功能**：生成短链接分享分析结果，数据存储在阿里云KV 中，30 天有效期。
- **安全架构**：API Key 存储在阿里云的加密环境变量中。前端仅与自建后端 (`/api/analyze`) 通信。
- **响应式设计**：基于 **Tailwind CSS** 构建的现代化"玻璃拟态"界面，完美适配手机、平板和桌面端。
- **动态热门话题**：实时获取热门话题，按语言分别缓存。

## 🛠 技术栈

| 层级 | 技术 |
|------|-----|
| **前端** | React 19, TypeScript, Vite, i18next |
| **后端** | 阿里云esa (JavaScript) |
| **样式** | Tailwind CSS, Lucide React (图标) |
| **AI 模型** | Google Gemini 3.0 Pro / Gemini 3.0 Flash |
| **搜索引擎** | Tavily AI Search API |
| **存储** | 阿里云 KV (用于分享链接) |

## 📁 项目结构

```
NetPulse/
├── App.tsx                 # 主应用组件
├── i18n.ts                 # i18next 配置
├── locales/
│   ├── zh/translation.json # 中文翻译
│   └── en/translation.json # 英文翻译
├── components/
│   ├── Header.tsx          # 头部（含语言切换器）
│   ├── SearchBar.tsx       # 搜索界面（含热门话题）
│   ├── ResultView.tsx      # 分析结果展示
│   ├── ShareButton.tsx     # 分享按钮组件
│   ├── ShareModal.tsx      # 分享配置弹窗
│   ├── SharedView.tsx      # 分享视图页面
│   ├── SettingsPanel.tsx   # 自定义 API Key 设置面板
│   ├── LanguageSwitcher.tsx# 响应式语言切换组件
│   ├── PrivacyPolicy.tsx   # 隐私政策页面
│   └── TermsOfService.tsx  # 使用条款页面
├── utils/
│   ├── shareUtils.ts       # 分享链接编解码工具
│   └── apiConfigStore.ts   # API 配置存储
├── services/
│   ├── geminiService.ts    # API 服务层
│   └── directApiService.ts # 自定义 Key 直接调用服务
├── types/
│   └── apiConfig.ts        # API 配置类型定义
└── backend/
    └── worker-i18n-v2.js   # esa
```

## 🚀 快速开始

### 前置要求
- Node.js (v18+) 或 Bun
- **Tavily API Key** (用于实时搜索)
- **Gemini API Key** (或支持 OpenAI 格式的中转 Key)

您也可以通过环境变量配置API密钥和模型参数：

1. 复制 `.env.example` 为 `.env`
2. 在 `.env` 文件中填入您的API密钥和模型配置

支持的环境变量包括：
- `VITE_GEMINI_API_KEY`: Gemini API密钥
- `VITE_TAVILY_API_KEY`: Tavily API密钥
- `VITE_TAVILY_API_KEY_1`: 第一个Tavily API密钥（支持轮询）
- `VITE_GEMINI_MODEL_FAST`: 快速模式使用的模型
- `VITE_GEMINI_MODEL_DEEP`: 深度模式使用的模型

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/EmmaStoneX/NetPulse.git
   cd NetPulse
   ```

2. **安装依赖**
   ```bash
   npm install
   # 或者
   bun install
   ```

3. **本地开发**
   ```bash
   npm run dev
   ```


## 声明
“本项目由阿里云ESA提供加速、计算和保护”
![Aliyun ESA Pages](locales/aliyunesapages.png)




