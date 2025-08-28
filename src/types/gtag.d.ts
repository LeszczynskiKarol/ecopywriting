// src/types/gtag.d.ts
interface Window {
  dataLayer: any[];
  gtag: (...args: any[]) => void;
}

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
