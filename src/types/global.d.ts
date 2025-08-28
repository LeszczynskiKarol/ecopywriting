// src/types/global.d.ts
interface Window {
  dataLayer: any[];
  gtag: (...args: any[]) => void;
  grecaptcha?: {
    ready: (callback: () => void) => void;
    execute: (siteKey: string, options: { action: string }) => Promise<string>;
  };
  heap?: {
    identify: (userId: string) => void;
    track: (eventName: string, properties?: Record<string, any>) => void;
    addUserProperties: (properties: Record<string, any>) => void;
    resetIdentity: () => void;
    load: (envId: string, config?: Record<string, any>) => void;
  };
  clarity?: {
    (method: string, ...args: any[]): void;
    identify: (userId: string, properties?: Record<string, any>) => void;
    set: (key: string, value: string) => void;
    upgrade: (amount: number) => void;
    consent: () => void;
  };
}
