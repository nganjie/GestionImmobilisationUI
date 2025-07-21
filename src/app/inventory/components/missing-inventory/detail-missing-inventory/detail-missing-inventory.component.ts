import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { InventoryService } from '../../../service/inventory.service';
import { MissingInventoryDetail } from '../../../models/missing-inventory-detail.model';
import { LanguageService } from '../../../../services/language/language.service';
import { CreateMissingInventoryComponent } from '../create-missing-inventory/create-missing-inventory.component';
import { InventoryStatusEnum } from '../../../../enums/inventory-status.enum';

@Component({
  selector: 'app-detail-missing-inventory',
  standalone: false,
  templateUrl: './detail-missing-inventory.component.html',
  styleUrl: './detail-missing-inventory.component.css'
})
export class DetailMissingInventoryComponent implements OnInit {
  missingInventoryId!: string;
  missingInventory$!: Observable<MissingInventoryDetail>;
  loading$!: Observable<boolean>;
  currentMissingInventory!: MissingInventoryDetail;

  // Énumérations
  inventoryStatusEnum = InventoryStatusEnum;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private inventoryService: InventoryService,
    private languageService: LanguageService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.missingInventoryId = this.route.snapshot.params['id'];
    this.loading$ = this.inventoryService.loading$;
    this.loadMissingInventoryDetail();
  }

  loadMissingInventoryDetail(): void {
    this.missingInventory$ = this.inventoryService.getMissingInventoryDetailFromServer(this.missingInventoryId);
    this.missingInventory$.subscribe(missingInventory => {
      this.currentMissingInventory = missingInventory;
    });
  }

  editMissingInventory(): void {
    const modalRef = this.modalService.open(CreateMissingInventoryComponent, {
      centered: true,
      backdrop: 'static',
      size: 'lg'
    });
    modalRef.componentInstance.missingInventoryId = this.missingInventoryId;
    
    var reloadPage: Observable<boolean>;
    reloadPage = modalRef.componentInstance.reload;
    reloadPage.subscribe((b) => {
      if (b) {
        this.loadMissingInventoryDetail();
      }
    });
  }

  deleteMissingInventory(): void {
    if (confirm(this.languageService.instant('ConfirmDelete'))) {
      this.inventoryService.deleteMissingInventory(this.missingInventoryId).subscribe(() => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
    }
  }

  goBack(): void {
    window.history.back();
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  formatDateTime(date: string): string {
    return new Date(date).toLocaleString();
  }

  getStatusIcon(status: InventoryStatusEnum): string {
    switch (status) {
      case InventoryStatusEnum.PENDING:
        return 'fas fa-clock';
      case InventoryStatusEnum.TERMINATED:
        return 'fas fa-check-circle';
      default:
        return 'fas fa-question-circle';
    }
  }

  getStatusClass(status: InventoryStatusEnum): string {
    switch (status) {
      case InventoryStatusEnum.PENDING:
        return 'badge bg-gradient-warning';
      case InventoryStatusEnum.TERMINATED:
        return 'badge bg-gradient-success';
      default:
        return 'badge bg-gradient-secondary';
    }
  }

  getStatusCardClass(status: InventoryStatusEnum): string {
    switch (status) {
      case InventoryStatusEnum.PENDING:
        return 'border-warning';
      case InventoryStatusEnum.TERMINATED:
        return 'border-success';
      default:
        return 'border-secondary';
    }
  }

  canEdit(): boolean {
    return this.currentMissingInventory && this.currentMissingInventory.status === InventoryStatusEnum.PENDING;
  }

  canDelete(): boolean {
    return true; // Ou selon votre logique métier
  }
}
