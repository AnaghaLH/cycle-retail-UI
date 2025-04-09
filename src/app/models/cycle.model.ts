export interface Cycle {
    $id:string;
    cycleId: number;
    modelName: string;
    brandId: number;
    brand: {
      brandId: number;
      brandName: string;
    };
    typeId: number;
    type: {
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
    $id?:string;
    brandId: number;
    brandName: string;
    description?: string;
  }
  
  export interface CycleType {
    $id?:string;
    typeId: number;
    typeName: string;
    description?: string;
  }