export interface Cycle {
    modelName: any;
    cycleId: number;
    ModelName: string;
    brandId: number;
    brand?: {
      brandId: number;
      brandName: string;
    };
    typeId: number;
    type?: {
      typeId: number;
      typeName: string;
    };
    description: string;
    price: number;
    stockQuantity: number;
    imageUrl: string;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  export interface CycleBrand {
    brandId: number;
    brandName: string;
    description?: string;
  }
  
  export interface CycleType {
    typeId: number;
    typeName: string;
    description?: string;
  }