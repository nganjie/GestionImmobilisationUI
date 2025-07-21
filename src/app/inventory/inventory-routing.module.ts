import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListInventoryComponent } from './components/inventories/list-inventory/list-inventory.component';
import { DetailInventoryComponent } from './components/inventories/detail-inventory/detail-inventory.component';
import { ListMissingInventoryComponent } from './components/missing-inventory/list-missing-inventory/list-missing-inventory.component';
import { DetailMissingInventoryComponent } from './components/missing-inventory/detail-missing-inventory/detail-missing-inventory.component';
import { ListBrokenInventoryComponent } from './components/broken-inventory/list-broken-inventory/list-broken-inventory.component';
import { DetailBrokenInventoryComponent } from './components/broken-inventory/detail-broken-inventory/detail-broken-inventory.component';
import { ReportInventoryComponent } from './components/report-inventory/report-inventory.component';

const routes: Routes = [
  { path: '', component: ListInventoryComponent },
  { path: 'detail/:id', component: DetailInventoryComponent },
  { path: 'report-inventory/:id', component: ReportInventoryComponent },
  { path: 'missing-inventory', component: ListMissingInventoryComponent },
  { path: 'missing-inventory/detail/:id', component: DetailMissingInventoryComponent },
  { path: 'broken-inventory', component: ListBrokenInventoryComponent },
  { path: 'broken-inventory/detail/:id', component: DetailBrokenInventoryComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryRoutingModule { }
