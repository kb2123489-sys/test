interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_TAVILY_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
