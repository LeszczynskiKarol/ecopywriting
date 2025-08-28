// src/types/order.ts

export interface OrderItem {
  topic: string;
  length: number;
  price: number;
  contentType: string;
  language: string;
  guidelines?: string;
}

export interface OrderAttachment {
  filename: string;
  url: string;
}

export interface Order {
    _id: string;
    orderNumber: string;
    items: OrderItem[];
    totalPrice: number;
    status: string;
    createdAt: string;
    declaredDeliveryDate: string;
    hasUnreadNotifications?: boolean;
    attachments?: {
      [key: string]: OrderAttachment | OrderAttachment[];
    };
    completedStatusFiles?: OrderAttachment[];
    userAttachments?: OrderAttachment[];
  }
  
  

export interface OrderComment {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  content: string;
  createdAt: string;
  attachments: OrderAttachment[];
  isAdminComment: boolean;
}