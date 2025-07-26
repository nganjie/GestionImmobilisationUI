import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UsersRoutingModule } from './users-routing.module';
import { ListUserComponent } from './components/list-user/list-user.component';
import { CreateUserComponent } from './components/create-user/create-user.component';
import { DetailUserComponent } from './components/detail-user/detail-user.component';
import { SharedModule } from "../shared/shared.module";
import { MatPaginatorModule } from '@angular/material/paginator';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { createTranslateLoader } from '../app.module';
import { LanguageService } from '../services/language/language.service';
import { UserService } from './services/user.service';
import { MatSelectModule } from '@angular/material/select';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [
    ListUserComponent,
    CreateUserComponent,
    DetailUserComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UsersRoutingModule,
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
    }),
    NgSelectModule,
    MatSelectModule
  ],
  providers:[
    LanguageService,
    UserService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class UsersModule { }
