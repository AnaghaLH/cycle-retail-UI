import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { HomeComponent } from './components/home/home.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CyclesComponent } from './components/cycles/cycles.component';
import { OrdersComponent } from './components/orders/orders.component';
import { CustomersComponent } from './components/customers/customers.component';
import { UsersComponent } from './components/users/users.component';
import { AdminGuard } from './guards/admin.guard';
import { CycleFormComponent } from './components/cycle-form/cycle-form.component';
import { OrderFormComponent } from './components/order-form/order-form.component';
import { OrderDetailComponent } from './components/order-detail/order-detail.component';
import { CustomerDetailComponent } from './components/customer-detail/customer-detail.component';
import { CustomerFormComponent } from './components/customer-form/customer-form.component';
import { PaymentFormComponent } from './components/payment-form/payment-form.component';
import { CycleDetailComponent } from './components/cycle-detail/cycle-detail.component';
import { ImageUploadComponent } from './components/image-upload/image-upload.component';
import { CycleShopComponent } from './components/cycle-shop/cycle-shop.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: '', 
    canActivate: [AuthGuard],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'cycles', component: CyclesComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'customers', component: CustomersComponent },
      { path: 'users', component: UsersComponent, canActivate: [AdminGuard] },
      {path: 'cycles', component: CyclesComponent, canActivate: [AuthGuard]},
      {path: 'cycles/new', component: CycleFormComponent, canActivate: [AuthGuard, AdminGuard]},
      // {path: 'cycles/:id', component: CycleFormComponent, canActivate: [AuthGuard]},
      {path: 'cycles/:id/edit', component: CycleFormComponent, canActivate: [AuthGuard, AdminGuard]},
      {path:'orders', component: OrdersComponent, canActivate:[AuthGuard]},
      {path:'orders/new', component: OrderFormComponent, canActivate:[AuthGuard]},
      {path:'orders/:id', component: OrderDetailComponent, canActivate:[AuthGuard]},
      {path:'customers', component:CustomersComponent, canActivate: [AuthGuard]},
      {path:'customers/new', component:CustomerFormComponent, canActivate: [AuthGuard]},
      {path:'customers/:id', component:CustomerDetailComponent, canActivate: [AuthGuard]},
      {path:'customers/:id/edit', component:CustomerFormComponent, canActivate: [AuthGuard]},
      {path:'payment',component:PaymentFormComponent, canActivate:[AuthGuard]},
      { path: 'cycles/:id', component:CycleDetailComponent, canActivate:[AuthGuard],data:{mode:'view'} },
      {path:'cycle-shop',component:CycleShopComponent},
      {path:'users',component:UsersComponent,canActivate:[AuthGuard]},


            ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }