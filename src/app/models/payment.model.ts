export interface Payment {
  paymentId?: number;
  orderId?: number | null;   // Now accepts number, undefined, or null
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  paymentDate?: string;
}