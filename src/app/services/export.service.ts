import { Injectable } from '@angular/core';
import { LanguageService } from './language/language.service';

export interface ExportColumn {
  key: string;
  label: string;
  translateKey?: string; // Clé de traduction optionnelle
  width?: number;
}

export interface ExportOptions {
  filename: string;
  title?: string;
  subtitle?: string;
  columns: ExportColumn[];
  data: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor(private languageService: LanguageService) { }

  /**
   * Exporte les données en format CSV
   */
  exportToCSV(options: ExportOptions): void {
    const { filename, columns, data } = options;
    
    // Créer l'en-tête CSV avec traductions
    const headers = columns.map(col => {
      const label = col.translateKey ? this.languageService.instant(col.translateKey) : col.label;
      return label;
    }).join(',');
    
    // Créer les lignes de données
    const rows = data.map(item => {
      return columns.map(col => {
        const value = this.getNestedValue(item, col.key);
        // Échapper les guillemets et virgules
        return this.escapeCsvValue(value);
      }).join(',');
    });
    
    // Combiner l'en-tête et les données
    const csvContent = [headers, ...rows].join('\n');
    
    // Télécharger le fichier
    this.downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
  }

  /**
   * Exporte les données en format Excel (sans bibliothèque)
   */
  exportToExcel(options: ExportOptions): void {
    const { filename, title, columns, data } = options;
    
    let excelContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:x="urn:schemas-microsoft-com:office:excel" 
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>${title || filename}</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
        </style>
      </head>
      <body>`;
    
    if (title) {
      excelContent += `<div class="title">${title}</div>`;
    }
    
    excelContent += '<table>';
    
    // En-tête avec traductions
    excelContent += '<tr>';
    columns.forEach(col => {
      const label = col.translateKey ? this.languageService.instant(col.translateKey) : col.label;
      excelContent += `<th>${label}</th>`;
    });
    excelContent += '</tr>';
    
    // Données
    data.forEach(item => {
      excelContent += '<tr>';
      columns.forEach(col => {
        const value = this.getNestedValue(item, col.key);
        excelContent += `<td>${this.escapeHtml(value)}</td>`;
      });
      excelContent += '</tr>';
    });
    
    excelContent += '</table></body></html>';
    
    // Télécharger le fichier
    this.downloadFile(excelContent, `${filename}.xls`, 'application/vnd.ms-excel');
  }

  /**
   * Exporte les données en format PDF (sans bibliothèque)
   */
  exportToPDF(options: ExportOptions): void {
    const { filename, title, subtitle, columns, data } = options;
    
    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      alert('Veuillez autoriser les popups pour télécharger le PDF');
      return;
    }
    
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title || filename}</title>
        <style>
          @page {
            size: A4;
            margin: 1cm;
          }
          body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            margin: 0;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
          }
          .subtitle {
            font-size: 16px;
            color: #666;
            margin-bottom: 10px;
          }
          .date {
            font-size: 12px;
            color: #999;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 11px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            word-wrap: break-word;
          }
          th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #333;
          }
          tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          .footer {
            position: fixed;
            bottom: 1cm;
            left: 1cm;
            right: 1cm;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
          }
          @media print {
            .no-print { display: none; }
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          ${title ? `<div class="title">${title}</div>` : ''}
          ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}
          <div class="date">${this.languageService.instant('export.generatedOn')} ${new Date().toLocaleDateString()} ${this.languageService.instant('export.at')} ${new Date().toLocaleTimeString()}</div>
        </div>
        
        <table>
          <thead>
            <tr>`;
    
    columns.forEach(col => {
      const label = col.translateKey ? this.languageService.instant(col.translateKey) : col.label;
      htmlContent += `<th style="width: ${col.width || 'auto'}">${label}</th>`;
    });
    
    htmlContent += `</tr>
          </thead>
          <tbody>`;
    
    data.forEach(item => {
      htmlContent += '<tr>';
      columns.forEach(col => {
        const value = this.getNestedValue(item, col.key);
        htmlContent += `<td>${this.escapeHtml(value)}</td>`;
      });
      htmlContent += '</tr>';
    });
    
    htmlContent += `</tbody>
        </table>
        
        <div class="footer">
          Page générée automatiquement - ${data.length} élément(s)
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            }
          }
        </script>
      </body>
      </html>`;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }

  /**
   * Utilitaire pour télécharger un fichier
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    // Nettoyer
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Utilitaire pour obtenir une valeur imbriquée d'un objet
   */
  private getNestedValue(obj: any, path: string): string {
    const value = path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);

    // Gérer les valeurs nulles ou undefined
    if (value === null || value === undefined) {
      return '';
    }

    // Formater les dates si c'est une date
    if (value && this.isDateField(path)) {
      return this.formatDate(value);
    }

    // Gérer les valeurs booléennes
    if (typeof value === 'boolean') {
      return value ? this.languageService.instant('Yes') || 'Oui' : this.languageService.instant('No') || 'Non';
    }

    // Gérer les valeurs pour email_verified_at (si null = Non vérifié, sinon Vérifié)
    if (path === 'email_verified_at') {
      return value ? this.languageService.instant('Verified') || 'Vérifié' : this.languageService.instant('NotVerified') || 'Non vérifié';
    }

    return value?.toString() || '';
  }

  /**
   * Vérifie si le champ est une date
   */
  private isDateField(fieldName: string): boolean {
    const dateFields = ['created_at', 'updated_at', 'date_of_receipt', 'transfer_date'];
    const field = fieldName.split('.').pop(); // Prendre la dernière partie du chemin
    return dateFields.includes(field || '');
  }

  /**
   * Formate une date pour l'affichage
   */
  private formatDate(dateValue: any): string {
    if (!dateValue) return '';
    
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return dateValue.toString();
      
      // Format: DD/MM/YYYY HH:mm
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      return dateValue.toString();
    }
  }

  /**
   * Échapper les valeurs CSV
   */
  private escapeCsvValue(value: string): string {
    if (!value) return '';
    
    const stringValue = value.toString();
    
    // Si la valeur contient des virgules, guillemets ou retours à la ligne
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      // Échapper les guillemets en les doublant et entourer de guillemets
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
  }

  /**
   * Échapper les caractères HTML
   */
  private escapeHtml(value: string): string {
    if (!value) return '';
    
    return value.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
