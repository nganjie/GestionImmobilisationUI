import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './core/components/dashboard/dashboard.component';
import { LoginComponent } from './core/components/login/login.component';

const routes: Routes = [
  {
  path:'admin',
    //loadChildren:()=>import('./core/core.module').then(m=>m.CoreModule)
    component:DashboardComponent,
    children: [
     
      {path:'',component:DashboardComponent},
      {path:'immobilisations',loadChildren:()=>import('./immobilisations/immobilisations.module').then(m=>m.ImmobilisationsModule)},
      {path:"employees",loadChildren:()=>import('./employees/employees.module').then(m=>m.EmployeesModule)},
      {path:"reformes",loadChildren:()=>import('./reformes/reformes.module').then(m=>m.ReformesModule)},
      {path:"inventories",loadChildren:()=>import('./inventory/inventory.module').then(m=>m.InventoryModule)},
      //{path:'client-accounts',loadChildren:()=>import('./client-accounts/client-accounts.module').then(m=>m.ClientAccountsModule),canActivate:[authRoleGuard],data:{roles:ClientsRouteRole}}
    ]
    },
    {path:'login',component:LoginComponent},
    { path: '', pathMatch: 'full', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
