// Create a file: types/global.d.ts or types/gtag.d.ts
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: {
        page_path?: string;
        page_title?: string;
        page_location?: string;
        [key: string]: any;
      }
    ) => void;
    dataLayer: any[];
  }
}

export {};