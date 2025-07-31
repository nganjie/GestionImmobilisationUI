import { Component, Input, signal } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-base',
  standalone: false,
  templateUrl: './base.component.html',
  styleUrl: './base.component.css'
})
export class BaseComponent {
  @Input() nameOption=''
  protected nameMenu!:Observable<string>
  constructor(){
    //this.nameMenu.update(value=>'name');
  }
  toggleSidebar() {
    // Logique pour basculer l'état de la barre latérale
    console.log('Sidebar toggled');
  }
}
