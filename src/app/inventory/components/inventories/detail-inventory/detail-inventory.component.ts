import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { InventoryService } from '../../../service/inventory.service';
import { InventoryDetail } from '../../../models/inventory-detail.model';
import { LanguageService } from '../../../../services/language/language.service';
import { CreateInventoryComponent } from '../create-inventory/create-inventory.component';
import { InventoryTypeEnum } from '../../../../enums/inventory-type.enum';

@Component({
  selector: 'app-detail-inventory',
  standalone: false,
  templateUrl: './detail-inventory.component.html',
  styleUrl: './detail-inventory.component.css'
})
export class DetailInventoryComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  inventory: InventoryDetail | null = null;
  loading$: Observable<boolean>;
  inventoryId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private inventoryService: InventoryService,
    private languageService: LanguageService,
    private modalService: NgbModal
  ) {
    this.loading$ = this.inventoryService.loading$;
  }

  ngOnInit(): void {
    this.inventoryId = this.route.snapshot.paramMap.get('id');
    if (this.inventoryId) {
      this.loadInventoryDetail();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadInventoryDetail(): void {
    if (this.inventoryId) {
      this.inventoryService.getInventoryDetailFromServer(this.inventoryId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            this.inventory = data;
          },
          error: (error) => {
            console.error('Error loading inventory detail:', error);
          }
        });
    }
  }

  goBack(): void {
    window.history.back();
  }

  editInventory(): void {
    if (this.inventoryId) {
      const modalRef = this.modalService.open(CreateInventoryComponent, {
        centered: true,
        backdrop: 'static',
        size: 'lg'
      });
      
      modalRef.componentInstance.inventoryId = this.inventoryId;
      modalRef.componentInstance.reload.subscribe((reload: boolean) => {
        if (reload) {
          this.loadInventoryDetail();
        }
      });
    }
  }

  deleteInventory(): void {
    if (this.inventoryId && this.inventory) {
      if (confirm(this.languageService.instant('ConfirmDelete'))) {
        this.inventoryService.deleteInventory(this.inventoryId).subscribe({
          next: () => {
            this.goBack();
          },
          error: (error) => {
            console.error('Error deleting inventory:', error);
          }
        });
      }
    }
  }

  closeInventory(): void {
    if (this.inventoryId && this.inventory) {
      this.inventoryService.closeInventory(this.inventoryId);
    }
  }

  generateReport(): void {
    if (this.inventoryId) {
      this.router.navigate(['/inventory/report-inventory', this.inventoryId]);
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  formatDateTime(date: string): string {
    return new Date(date).toLocaleString();
  }

  getTypeIcon(type: InventoryTypeEnum): string {
    switch (type) {
      case InventoryTypeEnum.ANNUAL:
        return 'fas fa-calendar-alt';
      case InventoryTypeEnum.HALFYEARLY:
        return 'fas fa-calendar';
      case InventoryTypeEnum.QUARTERLY:
        return 'fas fa-calendar-week';
      default:
        return 'fas fa-list';
    }
  }

  getTypeClass(type: InventoryTypeEnum): string {
    switch (type) {
      case InventoryTypeEnum.ANNUAL:
        return 'badge bg-gradient-primary';
      case InventoryTypeEnum.HALFYEARLY:
        return 'badge bg-gradient-info';
      case InventoryTypeEnum.QUARTERLY:
        return 'badge bg-gradient-warning';
      default:
        return 'badge bg-gradient-secondary';
    }
  }

  isInventoryActive(): boolean {
    if (!this.inventory || !this.inventory.end_date) {
      return true; // No end date means it's active
    }
    return new Date(this.inventory.end_date) > new Date();
  }

  getStatusIcon(): string {
    return this.isInventoryActive() ? 'fas fa-check-circle text-success' : 'fas fa-times-circle text-danger';
  }

  getStatusText(): string {
    return this.isInventoryActive() ? 'Active' : 'Expired';
  }
}
