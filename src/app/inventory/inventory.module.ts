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
import { SharedModule } from '../shared/shared.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../services/language/language.service';
import { HttpClient } from '@angular/common/http';
import { createTranslateLoader } from '../app.module';
import { ManageInventoryComponent } from './components/manage-inventory/manage-inventory.component';
import { ReportInventoryComponent } from './components/report-inventory/report-inventory.component';
import { BarcodeScannerLivestreamModule } from 'ngx-barcode-scanner';



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
    DetailBrokenInventoryComponent,
    ManageInventoryComponent,
    ReportInventoryComponent
  ],
  imports: [
    CommonModule,
    InventoryRoutingModule,
    SharedModule,
    MatPaginatorModule,
    TranslateModule.forRoot({
      loader:{
        provide:TranslateLoader,
        useFactory:(createTranslateLoader),
        deps:[HttpClient]
      }
    }
    ),
    BarcodeScannerLivestreamModule
  ],
  providers:[
    LanguageService
  ]
})
export class InventoryModule { }
