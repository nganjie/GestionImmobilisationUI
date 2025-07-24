import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListCategorieComponent } from '../immobilisations/components/list-categorie/list-categorie.component';
import { ListBuildingComponent } from './components/list-building/list-building.component';
import { ListOfficeComponent } from './components/list-office/list-office.component';
import { ListEmployeeComponent } from './components/list-employee/list-employee.component';
import { DetailEmployeeComponent } from './components/detail-employee/detail-employee.component';
import { GenererFicheDetenteurComponent } from './components/generer-fiche-detenteur/generer-fiche-detenteur.component';
import { ListTransferImmoEmployeeComponent } from './components/list-transfer-immo-employee/list-transfer-immo-employee.component';
import { TransferImmoEmployeeComponent } from './components/transfer-immo-employee/transfer-immo-employee.component';
import { DetailTransferImmoEmployeeComponent } from './components/detail-transfer-immo-employee/detail-transfer-immo-employee.component';

const routes: Routes = [
  {path:'',component:ListEmployeeComponent},
  {path:'fiche-detenteur/:id',component:GenererFicheDetenteurComponent},
  {path:'detail/:id',component:DetailEmployeeComponent},
  {path:'buildings',component:ListBuildingComponent},
  {path:'offices',component:ListOfficeComponent},
  {path:'transfers',component:ListTransferImmoEmployeeComponent},
  {path:'transfers/create',component:TransferImmoEmployeeComponent},
  {path:'transfers/detail/:id',component:DetailTransferImmoEmployeeComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeesRoutingModule { }
