import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from './components/base/base.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CustomSpinnerComponent } from './components/custom-spinner/custom-spinner.component';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { LanguageComponent } from './components/language/language.component';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { createTranslateLoader } from '../app.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    BaseComponent,
    CustomSpinnerComponent,
    LanguageComponent
  ],
  imports: [
    CommonModule,
    NgbTooltip,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    NgSelectModule,
    RouterModule,
    TranslateModule.forRoot({
      loader:{
        provide:TranslateLoader,
        useFactory:(createTranslateLoader),
        deps:[HttpClient]
      }
    }
    ),
  ],
  exports:[
    BaseComponent,
    FormsModule,
    NgbTooltip,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    CustomSpinnerComponent,
    NgSelectModule,
    
  ]
})
export class SharedModule { }
