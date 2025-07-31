import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { InventoryService } from '../../service/inventory.service';
import { InventoryDetail } from '../../models/inventory-detail.model';
import { MissingInventoryDetail } from '../../models/missing-inventory-detail.model';
import { BrokenInventoryDetail } from '../../models/broken-inventory-detail.model';
import { LanguageService } from '../../../services/language/language.service';
import { searchby } from '../../../models/search-element.model';

@Component({
  selector: 'app-report-inventory',
  standalone: false,
  templateUrl: './report-inventory.component.html',
  styleUrl: './report-inventory.component.css'
})
export class ReportInventoryComponent implements OnInit {
  inventoryId: string | null = null;
  inventory$!: Observable<InventoryDetail>;
  loading$!: Observable<boolean>;
  missingInventories$!: Observable<MissingInventoryDetail[]>;
  brokenInventories$!: Observable<BrokenInventoryDetail[]>;
  
  // Variables pour le rapport
  currentInventory: InventoryDetail | null = null;
  missingItems: MissingInventoryDetail[] = [];
  brokenItems: BrokenInventoryDetail[] = [];
  
  // Onglets actifs
  activeTab: 'missing' | 'broken' = 'missing';
  
  // État d'affichage
  showPreview: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private inventoryService: InventoryService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID de l'inventaire depuis l'URL
    this.inventoryId = this.route.snapshot.paramMap.get('id');
    
    if (this.inventoryId) {
      this.loadInventoryData();
      this.loadInventoryReportData();
    }
  }

  loadInventoryData(): void {
    this.loading$ = this.inventoryService.loading$;
    
    // Charger les détails de l'inventaire
    if (this.inventoryId) {
      this.inventory$ = this.inventoryService.getInventoryDetailFromServer(this.inventoryId);
      this.inventory$.subscribe(inventory => {
        this.currentInventory = inventory;
      });
    }
  }

  loadInventoryReportData(): void {
    if (!this.inventoryId) return;
    
    // Charger les éléments manquants pour cet inventaire
    this.missingInventories$ = this.inventoryService.missingInventories$;
    this.inventoryService.getMissingInventoriesFromServer(
      { current_page: 1, per_page: 1000 }, 
      [searchby('inventory_id', this.inventoryId)]
    );
    
    this.missingInventories$.subscribe(items => {
      this.missingItems = items;
    });
    
    // Charger les éléments cassés pour cet inventaire
    this.brokenInventories$ = this.inventoryService.brokenInventories$;
    this.inventoryService.getBrokenInventoriesFromServer(
      { current_page: 1, per_page: 1000 }, 
      [searchby('inventory_id', this.inventoryId)]
    );
    
    this.brokenInventories$.subscribe(items => {
      this.brokenItems = items;
    });
  }

  setActiveTab(tab: 'missing' | 'broken'): void {
    this.activeTab = tab;
  }

  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  printOrDownloadPDF(): void {
    window.print();
  }

  getTotalItems(): number {
    return this.missingItems.length + this.brokenItems.length;
  }

  getTotalValue(): number {
    let total = 0;
    
    this.missingItems.forEach(item => {
      if (item.immobilisation && item.immobilisation.unit_price && item.immobilisation.quantity) {
        total += item.immobilisation.unit_price ;
      }
    });
    
    this.brokenItems.forEach(item => {
      if (item.immobilisation && item.immobilisation.unit_price && item.immobilisation.quantity) {
        total += item.immobilisation.unit_price;
      }
    });
    
    return total;
  }

  getTotalMissingQuantity(): number {
    return this.missingItems.reduce((sum, item) => 
      sum + (item.immobilisation?.quantity || 0), 0
    );
  }

  getTotalBrokenQuantity(): number {
    return this.brokenItems.reduce((sum, item) => 
      sum + (item.immobilisation?.quantity || 0), 0
    );
  }

  getTotalMissingValue(): number {
    return this.missingItems.reduce((sum, item) => {
      if (item.immobilisation && item.immobilisation.unit_price && item.immobilisation.quantity) {
        return sum + (item.immobilisation.unit_price * item.immobilisation.quantity);
      }
      return sum;
    }, 0);
  }

  getTotalBrokenValue(): number {
    return this.brokenItems.reduce((sum, item) => {
      if (item.immobilisation && item.immobilisation.unit_price && item.immobilisation.quantity) {
        return sum + (item.immobilisation.unit_price * item.immobilisation.quantity);
      }
      return sum;
    }, 0);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('fr-FR');
  }

  getEmployeeName(item: any): string {
    if (item.immobilisation?.employee_immo?.employee) {
      const employee = item.immobilisation.employee_immo.employee;
      return `${employee.first_name} ${employee.last_name}`;
    }
    return '';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  }
}
