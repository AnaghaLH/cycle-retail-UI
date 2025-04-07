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
      {path: 'cycles/:id', component: CycleFormComponent, canActivate: [AuthGuard]},
      {path: 'cycles/:id/edit', component: CycleFormComponent, canActivate: [AuthGuard, AdminGuard]}
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }