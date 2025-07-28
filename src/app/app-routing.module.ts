import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './core/components/dashboard/dashboard.component';
import { LoginComponent } from './core/components/login/login.component';
import { RoleGuard } from './guards/role.guard';
import { CurrentUserComponent } from './core/components/current-user/current-user.component';

const routes: Routes = [
  {
  path:'admin',
    //loadChildren:()=>import('./core/core.module').then(m=>m.CoreModule)
    component:DashboardComponent,
    canActivate: [RoleGuard],
    data: { requiredRoles: ['SuperAdmin', 'Admin', 'Visitor'] },
    children: [
     
      {path:'',component:DashboardComponent},
      {
        path:'immobilisations',
        loadChildren:()=>import('./immobilisations/immobilisations.module').then(m=>m.ImmobilisationsModule),
        canActivate: [RoleGuard],
        data: { requiredRoles: ['SuperAdmin', 'Admin', 'Visitor'] }
      },
      {
        path:"employees",
        loadChildren:()=>import('./employees/employees.module').then(m=>m.EmployeesModule),
        canActivate: [RoleGuard],
        data: { requiredRoles: ['SuperAdmin', 'Admin'] }
      },
      {
        path:"reformes",
        loadChildren:()=>import('./reformes/reformes.module').then(m=>m.ReformesModule),
        canActivate: [RoleGuard],
        data: { requiredRoles: ['SuperAdmin', 'Admin'] }
      },
      {
        path:"inventories",
        loadChildren:()=>import('./inventory/inventory.module').then(m=>m.InventoryModule),
        canActivate: [RoleGuard],
        data: { requiredRoles: ['SuperAdmin', 'Admin', 'Visitor'] }
      },
      {
        path:"users",
        loadChildren:()=>import('./users/users.module').then(m=>m.UsersModule),
        canActivate: [RoleGuard],
        data: { requiredRoles: ['SuperAdmin'] }
      },
      {
        path:"profile",
        component: CurrentUserComponent,
        canActivate: [RoleGuard],
        data: { requiredRoles: ['SuperAdmin', 'Admin', 'Visitor'] }
      },
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
