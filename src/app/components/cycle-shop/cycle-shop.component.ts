// cycle-shop.component.ts
import { Component, OnInit } from '@angular/core';
import { CycleService } from 'src/app/services/cycle.service';
import { CartService } from 'src/app/services/cart.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { OrderService } from 'src/app/services/order.service';
import { AuthService } from 'src/app/services/auth.service';
import { CustomerService } from 'src/app/services/customer.service';
import { Customer, CustomerCreateDto } from 'src/app/models/customer.model';

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
    private cartService: CartService,
    private router: Router,
    private toastr: ToastrService,
    private orderService: OrderService,
    private authService: AuthService,
    private customerService: CustomerService
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
      error: (err) => {
        console.error('Error loading cycles', err);
        this.toastr.error('Failed to load cycles');
      }
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
    if (cycle.stockQuantity <= 0) {
      this.toastr.warning('This item is out of stock');
      return;
    }

    const added = this.cartService.addItem(cycle);
    if (added) {
      this.cartItems = this.cartService.getItems();
      this.cartOpen = true;
      this.toastr.success('Item added to cart');
    } else {
      this.toastr.error('Failed to add item to cart');
    }
  }
  updateQuantity(item: any, change: number): void {
    const updated = this.cartService.updateQuantity(item, change);
    if (updated) {
      this.cartItems = this.cartService.getItems();
      this.toastr.success('Cart updated');
    } else {
      this.toastr.error('Failed to update cart');
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
    if (this.cartItems.length === 0) {
      this.toastr.warning('Your cart is empty');
      return;
    }

    // Show enhanced customer selection dialog
    Swal.fire({
      title: '<strong>Select Customer</strong>',
      html: `
        <div class="customer-selection">
          <div class="selection-header">
            <i class="fas fa-user-circle mb-3" style="font-size: 3rem; color: #667eea;"></i>
            <h4 class="mb-3">How would you like to proceed?</h4>
          </div>
          <div class="selection-options">
            <button id="selectExisting" class="selection-btn existing-btn">
              <i class="fas fa-users me-2"></i>
              <div class="btn-content">
                <span class="btn-title">Select Existing Customer</span>
                <span class="btn-subtitle">Choose from your existing customers</span>
              </div>
            </button>
            <button id="createNew" class="selection-btn new-btn">
              <i class="fas fa-user-plus me-2"></i>
              <div class="btn-content">
                <span class="btn-title">Create New Customer</span>
                <span class="btn-subtitle">Add a new customer to your database</span>
              </div>
            </button>
          </div>
        </div>
      `,
      showConfirmButton: false,
      showCloseButton: true,
      allowOutsideClick: true,
      customClass: {
        popup: 'customer-selection-popup',
        closeButton: 'customer-selection-close'
      },
      background: '#ffffff',
      width: '500px',
      padding: '2rem'
    }).then((result) => {
      if (result.dismiss === Swal.DismissReason.close) {
        return;
      }
    });

    // Handle existing customer selection
    document.getElementById('selectExisting')?.addEventListener('click', () => {
      Swal.close();
      this.router.navigate(['/customers'], { 
        queryParams: { 
          returnUrl: '/payment',
          cartItems: JSON.stringify(this.cartItems)
        }
      });
    });

    // Handle new customer creation
    document.getElementById('createNew')?.addEventListener('click', () => {
      Swal.close();
      this.router.navigate(['/customers/new'], { 
        queryParams: { 
          returnUrl: '/payment',
          cartItems: JSON.stringify(this.cartItems)
        }
      });
    });
  }

  removeFromCart(item: any): void {
    this.cartService.removeItem(item);
    this.cartItems = this.cartService.getItems();
    this.toastr.success('Item removed from cart');
  }
}