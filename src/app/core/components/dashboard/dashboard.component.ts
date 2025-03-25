import { Component, NgZone, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit{
  nameMenu$!:Observable<string>
  constructor(private authService:AuthService,private ngZone: NgZone){
    window.addEventListener('storage', (event) => {
      console.log(event.newValue);
      console.log('add plush : ')
      if (event.key === 'nameMenu') {
        console.log('Nouvelle valeur:', event.newValue);
        this.ngZone.run(() => {
          console.log('Nouvelle valeur:', event.newValue);
        });
      }
    });
    localStorage.setItem('nameMenu','Dashboard');
  }
  ngOnInit(): void {
    
    
    this.nameMenu$=this.authService.nameMenu$;
    this.authService.setNameMenue('Dashboard tk');
  }
}
