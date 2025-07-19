import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { ReformeService } from '../../../services/reforme.service';
import { CessionDetail } from '../../../models/cession-detail';
import { LanguageService } from '../../../../services/language/language.service';

@Component({
  selector: 'app-detail-reforme-cession',
  standalone: false,
  templateUrl: './detail-reforme-cession.component.html',
  styleUrl: './detail-reforme-cession.component.css'
})
export class DetailReformeCessionComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  reformeCession?: CessionDetail;
  loading$: Observable<boolean>;
  error$: Observable<any>;
  reformeCessionId: string | null = null;

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
    this.reformeCessionId = this.route.snapshot.paramMap.get('id');
    if (this.reformeCessionId) {
      this.loadReformeCessionDetail();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadReformeCessionDetail(): void {
    if (this.reformeCessionId) {
      // TODO: Implement getReformeCessionDetailFromServer method in service
      // this.reformeService.getReformeCessionDetailFromServer(this.reformeCessionId)
      //   .pipe(
      //     tap(data => {
      //       console.log('Reforme Cession Detail:', data);
      //       this.reformeCession = data;
      //     }),
      //     takeUntil(this.destroy$)
      //   )
      //   .subscribe({
      //     next: (data) => {
      //       this.reformeCession = data;
      //     },
      //     error: (error) => {
      //       console.error('Erreur lors du chargement du détail:', error);
      //     }
      //   });
      
      // Temporary mock data
      this.reformeCession = {
        id: this.reformeCessionId,
        immobilisation_id: '1',
        entreprise_id: '1',
        comment: 'Cession temporaire pour démonstration',
        documents: ['doc1.pdf', 'doc2.jpg'],
        user_id: '1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        immobilisation: {
          id: '1',
          name: 'Ordinateur portable',
          code: 'ORD001',
          categorie: { id: '1', name: 'Informatique' },
          mark: 'Dell',
          model: 'Latitude',
          unit_price: 150000,
          quantity: 1,
          status: 'cession' as any,
          date_of_receipt: new Date().toISOString()
        } as any,
        entreprise: {
          id: '1',
          name: 'Entreprise ABC',
          nui: '123456789',
          adresse: '123 Rue de la Paix',
          tel: '+237 123 456 789',
          is_physic: false,
          user_id: '1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user: { id: '1', first_name: 'Admin', last_name: 'User' } as any
        },
        user: {
          id: '1',
          first_name: 'Admin',
          last_name: 'User',
          email: 'admin@example.com'
        } as any
      };
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/reformes/cession'], { relativeTo: this.route });
  }

  viewImmobilisationDetails(): void {
    if (this.reformeCession) {
      this.router.navigate(['/admin/immobilisations/detail', this.reformeCession.immobilisation_id]);
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
      case 'broken':
        return 'bg-gradient-danger';
      case 'cession':
        return 'bg-gradient-info';
      case 'sale':
        return 'bg-gradient-primary';
      default:
        return 'bg-gradient-secondary';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
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
