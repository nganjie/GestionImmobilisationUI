import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListCategorieComponent } from '../immobilisations/components/list-categorie/list-categorie.component';
import { ListBuildingComponent } from './components/list-building/list-building.component';
import { ListOfficeComponent } from './components/list-office/list-office.component';
import { ListEmployeeComponent } from './components/list-employee/list-employee.component';

const routes: Routes = [
  {path:'',component:ListEmployeeComponent},
  {path:'buildings',component:ListBuildingComponent},
  {path:'offices',component:ListOfficeComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeesRoutingModule { }
