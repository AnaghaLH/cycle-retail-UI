export interface Customer {
    createdAt: string|number|Date;
    customerId: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
}

export interface CustomerCreateDto {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
}