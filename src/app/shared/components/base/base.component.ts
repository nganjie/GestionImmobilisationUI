import { Component, Input, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { UserRole } from '../../../enums/roles.enum';
import { HavePermission } from '../../../models/data-server.model';

@Component({
  selector: 'app-base',
  standalone: false,
  templateUrl: './base.component.html',
  styleUrl: './base.component.css'
})
export class BaseComponent {
  @Input() nameOption='';
  protected UserRole = UserRole;
  protected currentRoles: UserRole[] =[]
  protected nameMenu!:Observable<string>
  constructor(){
    //this.nameMenu.update(value=>'name');
    this.currentRoles = this.getUserRoles();

  }
  toggleSidebar() {
    // Logique pour basculer l'état de la barre latérale
    console.log('Sidebar toggled');
  }
 protected havePermission(actionRole: UserRole): boolean {
    return HavePermission(this.currentRoles, [actionRole]);
  }
  getUserRoles(): UserRole[] {
    let userData = localStorage.getItem('userApp');
    if (userData) {
      let parsedData = JSON.parse(userData);
      return parsedData.roles.map((role: any) => role.name as UserRole);
    }
    return [];
  }
}
