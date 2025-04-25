import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { CustomerService } from '../../services/customer.service';
import { CycleService } from '../../services/cycle.service';

import { Order, OrderCreateDto} from 'src/app/models/order.model';
import { Customer } from 'src/app/models/customer.model';
import { Cycle } from 'src/app/models/cycle.model';
//import { CurrentUser } from 'src/app/models/user.model';

import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.scss']
})
export class OrderFormComponent implements OnInit {
  orderForm: FormGroup;
  isSubmitting = false;
  customers: Customer[] = [];
  availableCycles: Cycle[] = [];
  customerOrders: Order[] = [];
  orderTotal = 0;
  customerSearch: string = '';
  filteredCustomers: Customer[] = [];
  showCustomerList = false;
  showCycleListIndex: number | null = null;
  filteredCycles: Cycle[] = [];

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private customerService: CustomerService,
    private cycleService: CycleService,
    //private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.orderForm = this.fb.group({
      customerId: ['', Validators.required],
      // employeeId: ['', Validators.required],
      items: this.fb.array([this.createOrderItem()])
    });
  }
  currentUser: any;
  // ngOnInit(): void {
  //   this.loadCustomerOrders();
  //   this.loadAvailableCycles();
  //   this.currentUser = this.authService.currentUserValue;
  //   if (this.currentUser?.role === 'Employee') {
  //     this.orderForm.patchValue({
  //       employeeId: this.currentUser.userId
  //     });
  //   }
  //   this.loadCustomers();
  //   this.orderService.getOrders().subscribe({
  //     next: (orders) => {
  //       // ✅ See if items/quantity are there
  //       this.customerOrders = orders;
  //       console.log('Sample order:', this.customerOrders[3]);
  //     },
  //     error: (err) => {
  //       console.error('❌ Failed to load orders:', err);
  //     }
  //   });
  //   }
  ngOnInit(): void {
    this.loadAvailableCycles();
    this.loadCustomerOrders();
    this.loadCustomers();
    this.currentUser = this.authService.currentUserValue;
    if (this.currentUser?.role === 'Employee') {
      this.orderForm.patchValue({ employeeId: this.currentUser.userId });
    }
  
    this.customerService.getCustomers().subscribe(customers => {
      this.customers = customers;
    });
  
    // Load all orders (ensure includes OrderDetails)
    this.orderService.getOrders().subscribe(orders => {
      this.customerOrders = orders;
      console.log('Loaded orders with details:', orders);
    });
  }
  


  get orderItems(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  createOrderItem(): FormGroup {
    return this.fb.group({
      cycleId: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]]
    })
  }

  addItem(): void {
    this.orderItems.push(this.createOrderItem());
  }

  removeItem(index: number): void {
    this.orderItems.removeAt(index);
    this.calculateTotal();
  }

  loadCustomers(): void {
    this.customerService.getCustomers().subscribe(customers => {
      this.customers = customers;
      this.filteredCustomers = customers;
    });
  }
  
  getTotalQuantity(order: Order): number {
    
    if (!order.items) return 0;
    return order.items?.reduce((total, item) => total + item.quantity, 0)||0;
  }
  // getTotalQuantity(order: Order): number {
  //   return Array.isArray(order.items)
  //     ? order.items.reduce((total, item) => total + (item.quantity || 0), 0)
  //     : 0;
  // }
  
  

  loadAvailableCycles(): void {
    this.cycleService.getCycles().subscribe(cycles => {
      console.log('Cycle API response:', cycles); // ✅ Debug log
  
      if (Array.isArray(cycles)) {
        this.availableCycles = cycles.filter(c => c.stockQuantity > 0);
        this.filteredCycles = this.availableCycles;
      } else {
        console.warn('Unexpected response format:', cycles);
        this.availableCycles = [];
        this.filteredCycles = [];
      }
    }, error => {
      console.error('Error fetching cycles:', error);
      this.availableCycles = [];
      this.filteredCycles = [];
    });
  }
  
  selectedCustomerId: number | null = null;
  loadCustomerOrders(): void {
    const customerId = this.orderForm.value.customerId;
    if (customerId) {
      this.selectedCustomerId = customerId; 
      this.orderService.getCustomerOrders(customerId).subscribe(orders => {
        this.customerOrders = orders;
      });
    }
  }

  // onCycleChange(index: number): void {
  //   const cycleId = this.orderItems.at(index).get('cycleId')?.value;
  //   const selectedCycle = this.availableCycles.find(c => c.cycleId === cycleId);
    
  //   if (selectedCycle) {
  //     this.orderItems.at(index).patchValue({
  //       unitPrice: selectedCycle.price
  //     });
  //     this.calculateTotal();
  //   }
  // }
  onCycleChange(index: number): void {
    const items = this.orderForm.get('items') as FormArray;
    const itemGroup = items.at(index) as FormGroup;
    const selectedCycleId = +itemGroup.get('cycleId')?.value;
  
    const selectedCycle = this.availableCycles.find(c => c.cycleId === +selectedCycleId);
    console.log('Selected cycle:', selectedCycle);
  
    if (selectedCycle) {
      itemGroup.patchValue({
        unitPrice: selectedCycle.price,  // 💰 Autofill price
        quantity: 1,
        totalPrice: selectedCycle.price * 1                     // 🧾 Default quantity
      });
      this.calculateTotal();             // 🧮 Update total
    }
    else {
      console.warn('❌ Could not find cycle with id:', selectedCycleId);
    }
  }
  

  isCycleInOrder(cycleId: number, excludeIndex: number): boolean {
    return this.orderItems.controls.some((item, index) => 
      index !== excludeIndex && item.value.cycleId === cycleId
    );
  }

  // calculateTotal(): void {
  //   this.orderTotal = this.orderItems.controls.reduce((sum, item) => {
  //     return sum + (item.value.quantity * item.value.unitPrice);
  //   }, 0);
  // }
  calculateTotal(): void {
    const items = this.orderForm.get('items') as FormArray;
    this.orderTotal = items.controls.reduce((total, group) => {
      const quantity = group.get('quantity')?.value || 0;
      const unitPrice = group.get('unitPrice')?.value || 0;
      return total + (quantity * unitPrice);
    }, 0);
  }
  searchCustomers(): void {
    if (!this.customerSearch) {
      this.filteredCustomers = this.customers;
      return;
    }

    const searchTerm = this.customerSearch.toLowerCase();
    this.filteredCustomers = this.customers.filter(customer => 
      `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm)
    );
  }

  selectCustomer(customer: Customer): void {
    this.customerSearch = `${customer.firstName} ${customer.lastName}`;
    this.orderForm.patchValue({ customerId: customer.customerId });
    this.showCustomerList = false;
    this.loadCustomerOrders();
  }
  

  // onSubmit(): void {
  //   if (this.orderForm.invalid) return;

  //   this.isSubmitting = true;
  //   const currentUser = this.authService.currentUserValue;
    
  //   const orderData: OrderCreateDto = {
  //     customerId: this.orderForm.value.customerId,
  //     employeeId: currentUser.userId, // Get from logged in user
  //     items: this.orderForm.value.items.map((item: any) => ({
  //       cycleId: +item.cycleId,           // 👈 force to number
  //       quantity: item.quantity,
  //       unitPrice: item.unitPrice
  //     }))
  //   };
  //   console.log('Order Payload:', this.orderForm.value);

  //   this.orderService.createOrder(orderData).subscribe({
  //     next: () => {
  //       this.toastr.success('Order created successfully');
  //       this.router.navigate(['/orders']);
  //     },
  //     error: () => {
  //       this.toastr.error('Failed to create order');
  //       this.isSubmitting = false;
  //     }
  //   });
  // }
  onSubmit(): void {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }
  
    this.isSubmitting = true;
  
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      this.toastr.error('User is not authenticated');
      this.isSubmitting = false;
      return;
    }
  
    const rawItems = this.orderForm.value.items;
  
    // ✅ Extra validation: Check if any item is missing cycleId or unitPrice
    const hasInvalidItems = rawItems.some((item: any) => {
      return !item.cycleId || item.unitPrice === null || item.unitPrice === undefined;
    });
  
    if (hasInvalidItems) {
      this.toastr.warning('Please select a valid cycle and ensure prices are filled for all items.');
      this.isSubmitting = false;
      return;
    }
  
    const items = rawItems.map((item: any) => ({
      ...item,
      cycleId: +item.cycleId // Ensure it's a number
    }));
  
    console.log('Raw Items:', rawItems); // ✅ Check contents
  
    const orderData: OrderCreateDto = {
      customerId: this.orderForm.value.customerId,
      userId: Number(currentUser.userId),
      items
    };
  
    console.log('Order Payload:', orderData); // ✅ Final payload
  
    this.orderService.createOrder(orderData).subscribe({
      next: () => {
        this.isSubmitting=false;
        this.toastr.success('Order created successfully');
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        console.error('❌ Order creation failed:', err);
        this.toastr.error('Failed to create order');
        this.isSubmitting = false;
      }
    });
  
    console.log('Sending order to backend:', JSON.stringify(orderData, null, 2));
  }
  
  getSelectedCycleName(index: number): string {
    const cycleId = this.orderItems.at(index).get('cycleId')?.value;
    const cycle = this.availableCycles.find(c => c.cycleId === cycleId);
    return cycle ? `${cycle.modelName} (${cycle.brand.brandName})` : '';
  }

  showCycleList(index: number): void {
    this.showCycleListIndex = index;
  }

  toggleCycleList(index: number): void {
    this.showCycleListIndex = this.showCycleListIndex === index ? null : index;
  }

  selectCycle(cycle: Cycle, index: number): void {
    const itemGroup = this.orderItems.at(index) as FormGroup;
    itemGroup.patchValue({
      cycleId: cycle.cycleId,
      unitPrice: cycle.price,
      quantity: 1
    });
    this.showCycleListIndex = null;
    this.calculateTotal();
  }
}