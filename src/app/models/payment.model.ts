export interface Payment {
    orderId: number;
    amount: number;
    paymentMethod: string;
    transactionId?: string;
    status: string;
  }
  