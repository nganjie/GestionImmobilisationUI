import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ImmoService } from '../../services/immo.service';
import { ImmobilisationDetail } from '../../models/immobilisation-detail.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-detail-immobilisation',
  standalone: false,
  templateUrl: './detail-immobilisation.component.html',
  styleUrl: './detail-immobilisation.component.css'
})
export class DetailImmobilisationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  immobilisation: ImmobilisationDetail | null = null;
  loading$: Observable<boolean>;
  error$: Observable<any>;
  immoId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private immoService: ImmoService,
    private translateService: TranslateService
  ) {
    this.loading$ = this.immoService.loading$;
    this.error$ = this.immoService.error$;
  }

  ngOnInit(): void {
    this.immoId = this.route.snapshot.paramMap.get('id');
    if (this.immoId) {
      this.loadImmobilisationDetail();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadImmobilisationDetail(): void {
    if (this.immoId) {
      this.immoService.getImmoDetailFromServer(this.immoId)
        //.pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            this.immobilisation = data;
          },
          error: (error) => {
            console.error('Erreur lors du chargement du détail:', error);
          }
        });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/immobilisations'], { relativeTo: this.route });
  }

  editImmobilisation(): void {
    if (this.immoId) {
      this.router.navigate(['/admin/immobilisations/edit', this.immoId], { relativeTo: this.route });
    }
  }

  deleteImmobilisation(): void {
    this.immoService.deleteImmo(this.immoId as string);
  }

  duplicateImmobilisation(): void {
    if (this.immoId) {
      this.router.navigate(['../create'], { 
        relativeTo: this.route, 
        queryParams: { duplicate: this.immoId }
      });
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'badge bg-gradient-success';
      case 'inactive':
        return 'badge bg-gradient-secondary';
      case 'maintenance':
        return 'badge bg-gradient-warning';
      case 'disposed':
        return 'badge bg-gradient-danger';
      default:
        return 'badge bg-gradient-primary';
    }
  }

  getStatusIcon(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'fas fa-check-circle';
      case 'inactive':
        return 'fas fa-pause-circle';
      case 'maintenance':
        return 'fas fa-tools';
      case 'disposed':
        return 'fas fa-trash';
      default:
        return 'fas fa-info-circle';
    }
  }
}
