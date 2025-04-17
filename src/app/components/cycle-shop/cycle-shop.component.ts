// cycle-shop.component.ts
import { Component, OnInit } from '@angular/core';
import { CycleService } from 'src/app/services/cycle.service';
import { CartService } from 'src/app/services/cart.service';
@Component({
  selector: 'app-cycle-shop',
  templateUrl: './cycle-shop.component.html',
  styleUrls: ['./cycle-shop.component.scss']
})
export class CycleShopComponent implements OnInit {
  cycles: any[] = [];
  filteredCycles: any[] = [];
  cartItems: any[] = [];
  cartOpen = false;
  
  // Filters
  selectedBrand = '';
  priceRange = 5000;

  brands = [
    { brandId: 1, brandName: 'Trek', selected: false},
    { brandId: 2, brandName: 'Giant', selected: false},
    { brandId: 3, brandName: 'Specialized', selected: false}
  ];
  
  types = [
    { typeId: 1, typeName: 'Road', selected: false},
    { typeId: 2, typeName: 'Mountain' , selected: false},
    { typeId: 3, typeName: 'Hybrid', selected: false},
    { typeId: 4, typeName: 'Electric', selected: false }
  ];

  constructor(
    private cycleService: CycleService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadCycles();
    this.cartItems = this.cartService.getItems();
  }

  loadCycles(): void {
    this.cycleService.getCycles().subscribe({
      next: (response) => {
        // Handle both direct array and {$id, $values} response formats
        const cyclesArray = response.$values || response;
        this.cycles = Array.isArray(cyclesArray) ? cyclesArray : [];
        this.filteredCycles = [...this.cycles];
      },
      error: (err) => console.error('Error loading cycles', err)
    });
  }

  applyFilters(): void {
    this.filteredCycles = this.cycles.filter(cycle => {
      // Brand filter
      if (this.selectedBrand && cycle.brand.brandId.toString()!== this.selectedBrand.toString()) {
        return false;
      }
      
      // Price filter
      if (cycle.price > this.priceRange) {
        return false;
      }
      
      // Type filter
      const selectedTypes = this.types.filter(t => t.selected).map(t => t.typeId);
      if (selectedTypes.length > 0 && !selectedTypes.includes(cycle.type.typeId)) {
        return false;
      }
      
      return true;
    });
  }

  addToCart(cycle: any): void {
    const added = this.cartService.addItem(cycle);
    if (added) {
      this.cartItems = this.cartService.getItems();
      this.cartOpen = true;
    }
  }
  updateQuantity(item: any, change: number): void {
    const updated = this.cartService.updateQuantity(item, change);
    if (updated) {
      this.cartItems = this.cartService.getItems();
    }
  }
  toggleCart(): void {
    this.cartOpen = !this.cartOpen;
  }

  get cartTotal(): number {
    return this.cartItems.reduce((total, item) => 
      total + (item.price * item.quantity), 0);
  }

  checkout(): void {
    // Implement checkout logic
    console.log('Proceeding to checkout', this.cartItems);
  }
}