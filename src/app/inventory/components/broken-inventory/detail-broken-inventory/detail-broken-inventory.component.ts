import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { BaseComponent } from '../../../../shared/components/base/base.component';
import { InventoryService } from '../../../service/inventory.service';
import { BrokenInventoryDetail } from '../../../models/broken-inventory-detail.model';
import { CreateBrokenInventoryComponent } from '../create-broken-inventory/create-broken-inventory.component';
import { InventoryStatusEnum } from '../../../../enums/inventory-status.enum';

@Component({
  selector: 'app-detail-broken-inventory',
  standalone: false,
  templateUrl: './detail-broken-inventory.component.html',
  styleUrl: './detail-broken-inventory.component.css'
})
export class DetailBrokenInventoryComponent extends BaseComponent implements OnInit {
  brokenInventoryId!: string;
  brokenInventory!: BrokenInventoryDetail;
  loading$!: Observable<boolean>;
  
  // Énumérations
  inventoryStatusEnum = InventoryStatusEnum;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private inventoryService: InventoryService,
    private modalService: NgbModal
  ) {
    super();
  }

  ngOnInit(): void {
    this.loading$ = this.inventoryService.loading$;
    
    // Récupérer l'ID depuis les paramètres de route
    this.route.params.subscribe(params => {
      this.brokenInventoryId = params['id'];
      if (this.brokenInventoryId) {
        this.loadBrokenInventoryDetails();
      }
    });
  }

  loadBrokenInventoryDetails(): void {
    this.inventoryService.getBrokenInventoryDetailFromServer(this.brokenInventoryId).subscribe({
      next: (brokenInventory: BrokenInventoryDetail) => {
        this.brokenInventory = brokenInventory;
      },
      error: (error) => {
        console.error('Error loading broken inventory details:', error);
        this.router.navigate(['../'], { relativeTo: this.route });
      }
    });
  }

  editBrokenInventory(): void {
    const modalRef = this.modalService.open(CreateBrokenInventoryComponent, { 
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });
    
    modalRef.componentInstance.brokenInventoryId = this.brokenInventoryId;
    modalRef.componentInstance.isEditMode = true;
    
    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadBrokenInventoryDetails();
        }
      },
      (dismissed) => {
        // Modal fermée sans action
      }
    );
  }

  deleteBrokenInventory(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet élément cassé ?')) {
      this.inventoryService.deleteBrokenInventory(this.brokenInventoryId).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['../'], { relativeTo: this.route });
          }
        },
        error: (error) => {
          console.error('Error deleting broken inventory:', error);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case InventoryStatusEnum.PENDING:
        return 'badge bg-gradient-warning';
      case InventoryStatusEnum.TERMINATED:
        return 'badge bg-gradient-success';
      default:
        return 'badge bg-gradient-secondary';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case InventoryStatusEnum.PENDING:
        return 'fas fa-clock';
      case InventoryStatusEnum.TERMINATED:
        return 'fas fa-check';
      default:
        return 'fas fa-question';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
