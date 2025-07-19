import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { ReformeService } from '../../../services/reforme.service';
import { SaleDetail } from '../../../models/sale-detail.model';
import { LanguageService } from '../../../../services/language/language.service';

@Component({
  selector: 'app-detail-reforme-sale',
  standalone: false,
  templateUrl: './detail-reforme-sale.component.html',
  styleUrl: './detail-reforme-sale.component.css'
})
export class DetailReformeSaleComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  reformeSale?: SaleDetail;
  loading$: Observable<boolean>;
  error$: Observable<any>;
  reformeSaleId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reformeService: ReformeService,
    private languageService: LanguageService
  ) {
    this.loading$ = this.reformeService.loading$;
    this.error$ = this.reformeService.error$;
  }

  ngOnInit(): void {
    this.reformeSaleId = this.route.snapshot.paramMap.get('id');
    if (this.reformeSaleId) {
      this.loadReformeSaleDetail();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadReformeSaleDetail(): void {
    if (this.reformeSaleId) {
      this.reformeService.getReformeSaleDetailFromServer(this.reformeSaleId)
        .pipe(
          tap(data => {
            console.log('Reforme Sale Detail:', data);
            this.reformeSale = data;
          })
        )
        .subscribe();
    }
  }

  goBack(): void {
    window.history.back();
  }

  viewImmobilisationDetails(): void {
    if (this.reformeSale) {
      this.router.navigate(['/admin/immobilisations/detail', this.reformeSale.immobilisation_id]);
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-gradient-success';
      case 'inactive':
        return 'bg-gradient-secondary';
      case 'maintenance':
        return 'bg-gradient-warning';
      case 'sold':
        return 'bg-gradient-success';
      default:
        return 'bg-gradient-secondary';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  formatCurrency(amount: string | number): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(numAmount);
  }

  downloadDocument(documentUrl: string): void {
    window.open(documentUrl, '_blank');
  }

  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'fas fa-file-pdf';
      case 'doc':
      case 'docx':
        return 'fas fa-file-word';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'fas fa-file-image';
      default:
        return 'fas fa-file';
    }
  }
}
