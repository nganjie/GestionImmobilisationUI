import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployeesRoutingModule } from './employees-routing.module';
import { ListEmployeeComponent } from './components/list-employee/list-employee.component';
import { CreateEmployeeComponent } from './components/create-employee/create-employee.component';
import { ListBuildingComponent } from './components/list-building/list-building.component';
import { CreateBuildingComponent } from './components/create-building/create-building.component';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { createTranslateLoader } from '../app.module';
import { SharedModule } from '../shared/shared.module';
import { ListOfficeComponent } from './components/list-office/list-office.component';
import { CreateOfficeComponent } from './components/create-office/create-office.component';
import { EmployeeService } from './services/employee.service';
import { LanguageService } from '../services/language/language.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  declarations: [
    ListEmployeeComponent,
    CreateEmployeeComponent,
    ListBuildingComponent,
    CreateBuildingComponent,
    ListOfficeComponent,
    CreateOfficeComponent
  ],
  imports: [
    CommonModule,
    EmployeesRoutingModule,
    SharedModule,
    MatPaginatorModule,
    MatIconModule,
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
    NgxMatSelectSearchModule,
    MatFormFieldModule
  ],
  providers:[
    LanguageService,
    EmployeeService
  ]
})
export class EmployeesModule { }
