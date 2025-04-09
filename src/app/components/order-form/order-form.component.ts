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
  ngOnInit(): void {
    this.loadCustomers();
    this.loadAvailableCycles();
    this.currentUser = this.authService.currentUserValue;
    if (this.currentUser?.role === 'Employee') {
      this.orderForm.patchValue({
        employeeId: this.currentUser.userId
      });
    }
    }
  

  get orderItems(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  createOrderItem(): FormGroup {
    return this.fb.group({
      cycleId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]]
    });
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
      if (customers.length > 0) {
        this.orderForm.patchValue({ customerId: customers[0].customerId });
        this.loadCustomerOrders();
      }
    });
  }


  loadAvailableCycles(): void {
    this.cycleService.getCycles().subscribe(cycles => {
      console.log('Cycle API response:', cycles); // ✅ Debug log
  
      if (Array.isArray(cycles)) {
        this.availableCycles = cycles.filter(c => c.stockQuantity > 0);
      } else {
        console.warn('Unexpected response format:', cycles);
        this.availableCycles = [];
      }
    }, error => {
      console.error('Error fetching cycles:', error);
      this.availableCycles = [];
    });
  }
  

  loadCustomerOrders(): void {
    const customerId = this.orderForm.value.customerId;
    if (customerId) {
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
  
    const selectedCycle = this.availableCycles.find(c => c.cycleId === selectedCycleId);
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
    if (this.orderForm.invalid) return;
  
    this.isSubmitting = true;
    const currentUser = this.authService.currentUserValue;
  
    const rawItems = this.orderForm.value.items;
    const items = rawItems.map((item: any) => ({
      ...item,
      cycleId: +item.cycleId // Ensure it's a number
    }));
  
    const orderData: OrderCreateDto = {
      customerId: this.orderForm.value.customerId,
      employeeId: Number(currentUser.userId),
      items
    };
  
    console.log('Order Payload:', orderData); // ✅ Final payload
  
    this.orderService.createOrder(orderData).subscribe({
      next: () => {
        this.toastr.success('Order created successfully');
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        console.error('❌ Order creation failed:', err);
        this.toastr.error('Failed to create order');
        this.isSubmitting = false;
      }
    });
  }
  
}