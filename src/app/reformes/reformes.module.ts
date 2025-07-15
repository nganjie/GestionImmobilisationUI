import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

import { ReformesRoutingModule } from './reformes-routing.module';
import { ListEntrepriseComponent } from './components/entreprise/list-entreprise/list-entreprise.component';
import { CreateEntrepriseComponent } from './components/entreprise/create-entreprise/create-entreprise.component';
import { DetailEntrepriseComponent } from './components/entreprise/detail-entreprise/detail-entreprise.component';
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


@NgModule({
  declarations: [
    ListEntrepriseComponent,
    CreateEntrepriseComponent,
    DetailEntrepriseComponent
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
    MatSelectModule
  ]
})
export class ReformesModule { }
