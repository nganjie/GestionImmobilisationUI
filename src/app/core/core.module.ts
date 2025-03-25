import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreRoutingModule } from './core-routing.module';
import { SidebarLeftComponent } from './components/sidebar-left/sidebar-left.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SidebarTopComponent } from './components/sidebar-top/sidebar-top.component';
import { LoginComponent } from './components/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { RouterOutlet } from '@angular/router';


@NgModule({
  declarations: [
    SidebarLeftComponent,
    DashboardComponent,
    SidebarTopComponent,
    LoginComponent
  ],
  imports: [
    CommonModule,
    CoreRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    RouterOutlet,
  ],
  providers:[
    AuthService
  ]
})
export class CoreModule { }
