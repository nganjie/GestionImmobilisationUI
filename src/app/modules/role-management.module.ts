import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { HasRoleDirective } from '../directives/has-role.directive';
import { CanAccessDirective } from '../directives/can-access.directive';
import { CannotAccessDirective } from '../directives/cannot-access.directive';
import { RoleBadgeComponent } from '../components/role-badge/role-badge.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    HasRoleDirective,
    CanAccessDirective,
    CannotAccessDirective,
    RoleBadgeComponent
  ],
  exports: [
    HasRoleDirective,
    CanAccessDirective,
    CannotAccessDirective,
    RoleBadgeComponent
  ]
})
export class RoleManagementModule { }
