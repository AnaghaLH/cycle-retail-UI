export interface Order {
    orderId: number;
    customerId: number;
    
    customer?: {
      customerId: number;
      firstName: string;
      lastName: string;
      email?: string;
      phone?: string;
    };
    employeeId: number;
    employee?: {
      userId: number;
      username: string;
    };
    orderDate: Date;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    totalAmount: number;
    orderItems: OrderItem[];
  }
  
  export interface OrderItem {
    orderItemId?: number;
    orderId?: number;
    cycleId: number;
    cycle?: {
      cycleId: number;
      modelName: string;
      brandName: string;
      price: number;
      imageUrl?: string;
    };
    quantity: number;
    unitPrice: number;
  }
  
  export interface OrderCreateDto {
    customerId: number;
    employeeId: number;
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