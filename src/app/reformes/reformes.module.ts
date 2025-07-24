import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

import { ReformesRoutingModule } from './reformes-routing.module';
import { ListEntrepriseComponent } from './components/entreprise/list-entreprise/list-entreprise.component';
import { CreateEntrepriseComponent } from './components/entreprise/create-entreprise/create-entreprise.component';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { createTranslateLoader } from '../app.module';
import { ImmobilisationsRoutingModule } from '../immobilisations/immobilisations-routing.module';
import { SharedModule } from '../shared/shared.module';
import { ListBuyerComponent } from './components/buyer/list-buyer/list-buyer.component';
import { CreateBuyerComponent } from './components/buyer/create-buyer/create-buyer.component';
import { ListReformeBrokenComponent } from './components/broken/list-reforme-broken/list-reforme-broken.component';
import { CreateReformeBrokenComponent } from './components/broken/create-reforme-broken/create-reforme-broken.component';
import { DetailReformeBrokenComponent } from './components/broken/detail-reforme-broken/detail-reforme-broken.component';
import { LanguageService } from '../services/language/language.service';
import { ListReformeCessionComponent } from './components/cession/list-reforme-cession/list-reforme-cession.component';
import { CreateReformeCessionComponent } from './components/cession/create-reforme-cession/create-reforme-cession.component';
import { DetailReformeCessionComponent } from './components/cession/detail-reforme-cession/detail-reforme-cession.component';
import { ListReformeSaleComponent } from './components/sale/list-reforme-sale/list-reforme-sale.component';
import { CreateReformeSaleComponent } from './components/sale/create-reforme-sale/create-reforme-sale.component';
import { DetailReformeSaleComponent } from './components/sale/detail-reforme-sale/detail-reforme-sale.component';
import { BarcodeScannerLivestreamModule } from 'ngx-barcode-scanner';


@NgModule({
  declarations: [
    ListEntrepriseComponent,
    CreateEntrepriseComponent,
    ListBuyerComponent,
    CreateBuyerComponent,
    ListReformeBrokenComponent,
    CreateReformeBrokenComponent,
    DetailReformeBrokenComponent,
    ListReformeCessionComponent,
    CreateReformeCessionComponent,
    DetailReformeCessionComponent,
    ListReformeSaleComponent,
    CreateReformeSaleComponent,
    DetailReformeSaleComponent,
  ],
  imports: [
    CommonModule,
    ReformesRoutingModule,
    ReactiveFormsModule,
    ImmobilisationsRoutingModule,
    SharedModule,
    MatPaginatorModule,
    MatIconModule,
    DecimalPipe,
    TranslateModule.forRoot({
      loader:{
        provide:TranslateLoader,
        useFactory:(createTranslateLoader),
        deps:[HttpClient]
      }
    }
    ),
    NgSelectModule,
    MatSelectModule,
    BarcodeScannerLivestreamModule
  ],
  providers:[
    LanguageService
  ]
})
export class ReformesModule { }
