import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { ReformeService } from '../../../services/reforme.service';
import { ReformeBrokenDetail } from '../../../models/reforme-broken-detail';
import { LanguageService } from '../../../../services/language/language.service';

@Component({
  selector: 'app-detail-reforme-broken',
  standalone: false,
  templateUrl: './detail-reforme-broken.component.html',
  styleUrl: './detail-reforme-broken.component.css'
})
export class DetailReformeBrokenComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  reformeBroken?: ReformeBrokenDetail;
  loading$: Observable<boolean>;
  error$: Observable<any>;
  reformeBrokenId: string | null = null;

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
    this.reformeBrokenId = this.route.snapshot.paramMap.get('id');
    if (this.reformeBrokenId) {
      this.loadReformeBrokenDetail();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadReformeBrokenDetail(): void {
    if (this.reformeBrokenId) {
      this.reformeService.getReformeBrokenDetailFromServer(this.reformeBrokenId)
        .pipe(
          tap(data => {
            console.log('Reforme Broken Detail:', data);
            this.reformeBroken = data;
          })
        )
        .subscribe();
    }
  }

  goBack(): void {
    window.history.back();
  }

  viewImmobilisationDetails(): void {
    if (this.reformeBroken) {
      this.router.navigate(['/admin/immobilisations/detail', this.reformeBroken.immobilisation_id]);
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
