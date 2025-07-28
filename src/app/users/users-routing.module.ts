import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListUserComponent } from './components/list-user/list-user.component';
import { DetailUserComponent } from './components/detail-user/detail-user.component';
import { CreateUserComponent } from './components/create-user/create-user.component';
import { RoleGuard } from '../guards/role.guard';
import { UserRole } from '../enums/roles.enum';

const routes: Routes = [
  {
    path: '',
    component: ListUserComponent,
    canActivate: [RoleGuard],
    data: { roles: [UserRole.SUPER_ADMIN] }
  },
  {
    path: 'detail/:id',
    component: DetailUserComponent,
    canActivate: [RoleGuard],
    data: { roles: [UserRole.SUPER_ADMIN] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
