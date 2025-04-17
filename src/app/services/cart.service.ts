// cart.service.ts
import { Injectable } from '@angular/core';
import { Cycle } from '../models/cycle.model';
import { ToastrService } from 'ngx-toastr';
@Injectable({
  providedIn: 'root'
})
export class CartService {
  constructor(private toastr: ToastrService) {}
  private items: any[] = [];

  // cart.service.ts
// addItem(item: Cycle): void {
//   const itemId = item.cycleId;
//   const existingItem = this.items.find(i => i.cycleId === itemId);
  
//   if (existingItem) {
    
//     existingItem.quantity++;
//   } else {
//     this.items.push({
//       cycleId: item.cycleId,
//       modelName: item.modelName,
//       type: item.type,          // Add cycle type
//       stock: item.stockQuantity, // Add stock quantity
//       price: item.price,
//       imageUrl: item.imageUrl,
//       quantity: 1
//     });
//   }
// }

addItem(item: any): boolean {
  const itemId = item.cycleId;
  const existingItem = this.items.find(i => i.cycleId === itemId);
  
  if (existingItem) {
    if (existingItem.quantity >= existingItem.stock) {
      this.toastr.warning(`Cannot add more than available stock (${existingItem.stock})`);
      return false;
    }
    existingItem.quantity++;
  } else {
    if (item.stockQuantity <= 0) {
      this.toastr.warning('This item is currently out of stock');
      return false;
    }
    this.items.push({
      cycleId: item.cycleId,
      modelName: item.modelName,
      type: item.type,
      stock: item.stockQuantity,
      price: item.price,
      imageUrl: item.imageUrl,
      quantity: 1
    });
  }
  return true;
}

 // cart.service.ts
updateQuantity(item: any, change: number): boolean {
  const itemId = item.cycleId; // Make sure this matches your item identifier
  const foundItem = this.items.find(i => i.cycleId === itemId);
  
  if (foundItem) {
    const newQuantity = foundItem.quantity + change;
    
    // Prevent going below 0
    if (newQuantity <= 0) {
      this.removeItem(itemId);
      return true;
    }
    
    // Check stock limit when increasing
    if (change > 0 && newQuantity > foundItem.stock) {
      this.toastr.warning(`Cannot exceed available stock (${foundItem.stock})`);
      return false;
    }
    
    foundItem.quantity = newQuantity;
    return true;
  }
  return false;
}

removeItem(itemId: number): void {
  this.items = this.items.filter(i => i.cycleId !== itemId);
}
  getItems(): any[] {
    return [...this.items];
  }

  clearCart(): void {
    this.items = [];
  }

  getTotal(): number {
    return this.items.reduce((total, item) => 
      total + (item.price * item.quantity), 0);
  }
}