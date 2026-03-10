// Create a file: types/global.d.ts or types/gtag.d.ts
declare global {
  interface Window {
    gtag: (command: string, id: string, params?: Record<string, any>) => void;
  }
}

export {};