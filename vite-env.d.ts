
export {};

declare global {
  // Define ImportMetaEnv to resolve types for import.meta.env
  // We keep these definitions just in case, though they aren't used in the main logic anymore.
  interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY: string;
    readonly VITE_TAVILY_API_KEY: string;
    [key: string]: any;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
