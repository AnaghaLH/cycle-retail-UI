export interface Order {
  date: string | number | Date;
  orderId: number;
  customerId: number;
  customerName: string; // ✅ add this to match backend
  employeeId?: number;
  orderDate: string; // or Date if you're converting
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  totalAmount: number;
  totalQuantity: number;
  items: {
    cycleId: number;
    cycleName: string;
    quantity: number;
    unitPrice: number;
  }[]; // Or orderItems if your API uses that
}
  
  export interface OrderItem {
    orderItemId?: number;
    orderId?: number;
    cycleId: number;
    quantity: number;
    unitPrice: number;
    cycleName: string;
    // cycle?: {
    //   cycleId: number;
    //   modelName: string;
    //   brandName: string;
    //   price: number;
    //   imageUrl?: string;
    // };
    
  }
  
  export interface OrderCreateDto {
    customerId: number;
    userId: number;
    items: OrderItemDto[];
  }
  
  export interface OrderItemDto {
    cycleId: number;
    quantity: number;
    unitPrice: number;
  }
  
  export interface OrderStatusUpdateDto {
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  }