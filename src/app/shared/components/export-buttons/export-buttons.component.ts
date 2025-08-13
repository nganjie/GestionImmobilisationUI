import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ExportService, ExportOptions } from '../../../services/export.service';

export type ExportFormat = 'csv' | 'excel' | 'pdf';

@Component({
  selector: 'app-export-buttons',
  standalone: false,
  templateUrl: './export-buttons.component.html',
  styleUrl: './export-buttons.component.css'
})
export class ExportButtonsComponent {
  @Input() data: any[] = [];
  @Input() columns: any[] = [];
  @Input() filename: string = 'export';
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() showCsv: boolean = true;
  @Input() showExcel: boolean = true;
  @Input() showPdf: boolean = true;
  @Input() buttonClass: string = 'btn btn-outline-primary btn-sm';
  @Input() isLoading: boolean = false;
  
  @Output() beforeExport = new EventEmitter<{ format: ExportFormat, data: any[] }>();
  @Output() afterExport = new EventEmitter<{ format: ExportFormat, success: boolean }>();

  constructor(private exportService: ExportService) { }

  exportData(format: ExportFormat): void {
    if (this.isLoading || !this.data.length) {
      return;
    }

    // Émettre l'événement avant export
    this.beforeExport.emit({ format, data: this.data });

    try {
      const options: ExportOptions = {
        filename: this.filename,
        title: this.title,
        subtitle: this.subtitle,
        columns: this.columns,
        data: this.data
      };

      switch (format) {
        case 'csv':
          this.exportService.exportToCSV(options);
          break;
        case 'excel':
          this.exportService.exportToExcel(options);
          break;
        case 'pdf':
          this.exportService.exportToPDF(options);
          break;
      }

      // Émettre l'événement après export réussi
      this.afterExport.emit({ format, success: true });
    } catch (error) {
      console.error(`Erreur lors de l'export ${format}:`, error);
      this.afterExport.emit({ format, success: false });
    }
  }

  getButtonIcon(format: ExportFormat): string {
    switch (format) {
      case 'csv': return 'fa fa-file-csv';
      case 'excel': return 'fa fa-file-excel';
      case 'pdf': return 'fa fa-file-pdf';
      default: return 'fa fa-download';
    }
  }

  getButtonLabel(format: ExportFormat): string {
    switch (format) {
      case 'csv': return 'CSV';
      case 'excel': return 'Excel';
      case 'pdf': return 'PDF';
      default: return 'Export';
    }
  }
}
