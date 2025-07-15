import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImmobilisationsRoutingModule } from './immobilisations-routing.module';
import { ListImmobilisationComponent } from './components/list-immobilisation/list-immobilisation.component';
import { SharedModule } from "../shared/shared.module";
import { MatPaginatorModule } from '@angular/material/paginator';
import { ListCategorieComponent } from './components/list-categorie/list-categorie.component';
import { ListStructureComponent } from './components/list-structure/list-structure.component';
import { ListFournisseurComponent } from './components/list-fournisseur/list-fournisseur.component';
import { CreateCategorieComponent } from './components/create-categorie/create-categorie.component';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { createTranslateLoader } from '../app.module';
import { LanguageService } from '../services/language/language.service';
import { ImmoService } from './services/immo.service';
import { CreateStructureComponent } from './components/create-structure/create-structure.component';
import { CreateFournisseurComponent } from './components/create-fournisseur/create-fournisseur.component';
import { CreateImmobilisationComponent } from './components/create-immobilisation/create-immobilisation.component';
import { MatSelectModule } from '@angular/material/select';
import { NgSelectModule } from '@ng-select/ng-select';
import { DetailImmobilisationComponent } from './components/detail-immobilisation/detail-immobilisation.component';
import { GenerateCodeBareImmobilisationsComponent } from './components/generate-code-bare-immobilisations/generate-code-bare-immobilisations.component';


@NgModule({
  declarations: [
    ListImmobilisationComponent,
    ListCategorieComponent,
    ListStructureComponent,
    ListFournisseurComponent,
    CreateCategorieComponent,
    CreateStructureComponent,
    CreateFournisseurComponent,
    CreateImmobilisationComponent,
    DetailImmobilisationComponent,
    GenerateCodeBareImmobilisationsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
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
],
providers:[
  LanguageService,
  ImmoService
],
schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ImmobilisationsModule { }
