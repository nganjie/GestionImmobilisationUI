import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RouterOutlet } from '@angular/router';
import { CoreModule } from './core/core.module';
import { AuthService } from './services/auth.service';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule, provideHttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { LanguageService } from './services/language/language.service';
import { MatSelectModule } from '@angular/material/select';
import { BarcodeScannerLivestreamModule } from "ngx-barcode-scanner";
import { RoleManagementModule } from './modules/role-management.module';
import { RoleGuard } from './guards/role.guard';
import { APP_NAME } from './app-name.token';
import { ErrorInterceptorService } from './services/error-interceptor.interceptor';

export function createTranslateLoader(http:HttpClient){
  return new TranslateHttpLoader(http,'./i18n/','.json');
}
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterOutlet,
    CoreModule,
    RoleManagementModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader:{
        provide:TranslateLoader,
        useFactory:(createTranslateLoader),
        deps:[HttpClient]
      }
    }
    ),
    MatSelectModule,
    BarcodeScannerLivestreamModule
  ],
  providers: [
    AuthService,
    LanguageService,
    RoleGuard,
     { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptorService, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
