// src/interfaces/common.ts

export interface Order {
    _id: string;
    items: Array<{ topic: string }>;
    status: string;
    createdAt: string;
  }
  
  export interface Invoice {
    _id: string;
    invoiceNumber: string;
    amount: number;
    status: string;
    createdAt: string;
    stripeSessionId: string | null;
    pdfUrl?: string;
  }
  