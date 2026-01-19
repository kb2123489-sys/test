// 搜索服务提供商
export type SearchProvider = 'tavily' | 'exa';

// 大模型服务提供商
export type LLMProvider = 'gemini' | 'deepseek' | 'openai' | 'claude' | 'custom';

// API 配置接口
export interface APIConfig {
  // 搜索配置
  searchProvider: SearchProvider;
  searchApiKey: string;

  // LLM 配置
  llmProvider: LLMProvider;
  llmApiKey: string;
  llmEndpoint: string; // 自定义端点，支持中转站
  llmModelFast: string; // 快速模式模型
  llmModelDeep: string; // 深度模式模型

  // 是否启用自定义配置
  enabled: boolean;
}

// 默认配置
export const DEFAULT_API_CONFIG: APIConfig = {
  searchProvider: 'tavily',
  searchApiKey: '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',
  llmProvider: 'openai',
  llmApiKey: 'sk-ycvmoyoyzpsdcoivdowxpxetxrfndvxdizrzmaedzxccuegm',
  llmEndpoint: 'https://api.siliconflow.cn/v1', // 空表示使用官方端点
  llmModelFast: 'Qwen/Qwen2.5-7B-Instruct', // 空表示使用默认模型
  llmModelDeep: 'Qwen/Qwen2.5-7B-Instruct', // 空表示使用默认模型
  enabled: true,
};

// 搜索提供商信息
export interface SearchProviderInfo {
  name: string;
  endpoint: string;
  docsUrl: string;
}

// LLM 提供商信息
export interface LLMProviderInfo {
  name: string;
  endpoint: string;
  models: { fast: string; deep: string };
  docsUrl: string;
}

// 各提供商的 API 端点和模型信息
export const PROVIDER_INFO = {
  search: {
    tavily: {
      name: 'Tavily',
      endpoint: 'https://api.tavily.com/search',
      docsUrl: 'https://tavily.com',
    },
    exa: {
      name: 'Exa',
      endpoint: 'https://api.exa.ai/search',
      docsUrl: 'https://exa.ai',
    },
  } as Record<SearchProvider, SearchProviderInfo>,
  llm: {
    gemini: {
      name: 'Google Gemini',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta',
      models: { fast: 'gemini-3.0-flash', deep: 'gemini-3.0-pro' },
      docsUrl: 'https://ai.google.dev',
    },
    deepseek: {
      name: 'DeepSeek',
      endpoint: 'https://api.deepseek.com/v1',
      models: { fast: 'deepseek-chat', deep: 'deepseek-reasoner' },
      docsUrl: 'https://platform.deepseek.com',
    },
    openai: {
      name: 'OpenAI',
      endpoint: 'https://api.openai.com/v1',
      models: { fast: 'gpt-5.2-mini', deep: 'gpt-5.2' },
      docsUrl: 'https://platform.openai.com',
    },
    claude: {
      name: 'Anthropic Claude',
      endpoint: 'https://api.anthropic.com/v1',
      models: { fast: 'claude-4-5-haiku-latest', deep: 'claude-4-5-sonnet-latest' },
      docsUrl: 'https://console.anthropic.com',
    },
    custom: {
      name: '自定义',
      endpoint: '',
      models: { fast: '', deep: '' },
      docsUrl: '',
    },
  } as Record<LLMProvider, LLMProviderInfo>,
};
