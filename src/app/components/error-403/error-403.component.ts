import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-error-403',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <div class="card shadow-lg">
            <div class="card-body text-center p-5">
              <!-- Icône d'erreur -->
              <div class="mb-4">
                <i class="fas fa-exclamation-triangle text-warning" style="font-size: 4rem;"></i>
              </div>
              
              <!-- Titre et message -->
              <h1 class="display-4 text-dark mb-3">403</h1>
              <h3 class="text-secondary mb-4">{{"AccessDenied"|translate}}</h3>
              <p class="text-muted mb-4">
                {{"AccessDeniedMessage"|translate}}
              </p>
              
              <!-- Informations sur les permissions -->
              <div class="alert alert-warning" role="alert">
                <i class="fas fa-info-circle me-2"></i>
                {{"ContactAdminForAccess"|translate}}
              </div>
              
              <!-- Boutons d'action -->
              <div class="d-flex justify-content-center gap-3 mt-4">
                <button 
                  class="btn btn-outline-secondary"
                  (click)="goBack()">
                  <i class="fas fa-arrow-left me-2"></i>
                  {{"GoBack"|translate}}
                </button>
                
                <button 
                  class="btn btn-primary"
                  (click)="goHome()">
                  <i class="fas fa-home me-2"></i>
                  {{"GoToHomePage"|translate}}
                </button>
              </div>
              
              <!-- URL de retour si disponible -->
              <div class="mt-4" *ngIf="returnUrl">
                <small class="text-muted">
                  {{"RequestedPage"|translate}}: {{returnUrl}}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border: none;
      border-radius: 15px;
    }
    
    .btn {
      border-radius: 25px;
      padding: 10px 30px;
    }
    
    .fa-exclamation-triangle {
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
  `]
})
export class Error403Component implements OnInit {
  returnUrl: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'];
  }

  goBack() {
    window.history.back();
  }

  goHome() {
    this.router.navigate(['/dashboard']);
  }
}
