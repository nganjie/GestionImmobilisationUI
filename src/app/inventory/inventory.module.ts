import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InventoryRoutingModule } from './inventory-routing.module';
import { ListInventoryComponent } from './components/inventories/list-inventory/list-inventory.component';
import { CreateInventoryComponent } from './components/inventories/create-inventory/create-inventory.component';
import { DetailInventoryComponent } from './components/inventories/detail-inventory/detail-inventory.component';
import { ListMissingInventoryComponent } from './components/missing-inventory/list-missing-inventory/list-missing-inventory.component';
import { CreateMissingInventoryComponent } from './components/missing-inventory/create-missing-inventory/create-missing-inventory.component';
import { DetailMissingInventoryComponent } from './components/missing-inventory/detail-missing-inventory/detail-missing-inventory.component';
import { ListBrokenInventoryComponent } from './components/broken-inventory/list-broken-inventory/list-broken-inventory.component';
import { CreateBrokenInventoryComponent } from './components/broken-inventory/create-broken-inventory/create-broken-inventory.component';
import { DetailBrokenInventoryComponent } from './components/broken-inventory/detail-broken-inventory/detail-broken-inventory.component';



@NgModule({
  declarations: [
    ListInventoryComponent,
    CreateInventoryComponent,
    DetailInventoryComponent,
    ListMissingInventoryComponent,
    CreateMissingInventoryComponent,
    DetailMissingInventoryComponent,
    ListBrokenInventoryComponent,
    CreateBrokenInventoryComponent,
    DetailBrokenInventoryComponent
  ],
  imports: [
    CommonModule,
    InventoryRoutingModule
  ]
})
export class InventoryModule { }
