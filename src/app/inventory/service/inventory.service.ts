import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map, catchError, of } from 'rxjs';
import { GlobalServices } from '../../services/global.services';
import { InventoryDetail } from '../models/inventory-detail.model';
import { MissingInventoryDetail } from '../models/missing-inventory-detail.model';
import { BrokenInventoryDetail } from '../models/broken-inventory-detail.model';
import { ApiPaginatedResponse, ApiResponse } from '../../models/data-server.model';
import { environment } from '../../../environments/environment';
import { PaginateData } from '../../models/paginate-data.model';
import { exploseSearchOption, searchOption } from '../../models/search-element.model';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class InventoryService extends GlobalServices {

  constructor(private https: HttpClient, private snak: MatSnackBar, private router: Router) {
    super(https, snak);
  }

  private _inventories$ = new BehaviorSubject<InventoryDetail[]>([]);
  get inventories$(): Observable<InventoryDetail[]> {
    return this._inventories$.asObservable();
  }

  private _missingInventories$ = new BehaviorSubject<MissingInventoryDetail[]>([]);
  get missingInventories$(): Observable<MissingInventoryDetail[]> {
    return this._missingInventories$.asObservable();
  }

  private _brokenInventories$ = new BehaviorSubject<BrokenInventoryDetail[]>([]);
  get brokenInventories$(): Observable<BrokenInventoryDetail[]> {
    return this._brokenInventories$.asObservable();
  }

  getInventoriesFromServer(paginateD: PaginateData = this.emptyPaginate, searchOptions: searchOption[] = []) {
    const header = this.getHearder();
    let pagin = this.explosePaginationOption(paginateD);
    let search = exploseSearchOption(searchOptions);
    pagin += search ? `&${search}` : '';
    this.setLoadStatus(true);
    
    this.http.get<ApiPaginatedResponse<InventoryDetail>>(`${environment.apiUrlFirst}/admin/inventories/all?${pagin}`, header).pipe(
      map(data => {
        this.setLoadStatus(false);
        console.log('Inventories data:', data);
        this._inventories$.next(data.data?.data ?? []);
        this._paginateData$.next({
          current_page: data.data?.current_page ?? 1,
          per_page: data.data?.per_page ?? 1,
          total: data.data?.total ?? 1,
        });
      }),
      catchError(error => {
        this.setLoadStatus(false);
        this.setSnackMesage('Error loading inventories', 'btn-danger');
        return of([]);
      })
    ).subscribe();
  }

  getInventoryDetailFromServer(inventoryId: string): Observable<InventoryDetail> {
    const header = this.getHearder();
    this.setLoadStatus(true);
    
    return this.http.get<ApiResponse<InventoryDetail>>(`${environment.apiUrlFirst}/admin/inventories/${inventoryId}`, header).pipe(
      map(data => {
        this.setLoadStatus(false);
        return data.data!;
      }),
      catchError(error => {
        this.setLoadStatus(false);
        this.setSnackMesage('Error loading inventory details', 'btn-danger');
        throw error;
      })
    );
  }

  createInventory(formData: FormGroup): Observable<any> {
    const header = this.getHearder();
    this.setLoadStatus(true);
    
    return this.http.post<ApiResponse<any>>(`${environment.apiUrlFirst}/admin/inventories/create`, formData.value, header).pipe(
      map(data => {
        this.setLoadStatus(false);
        if (data.success) {
          this.setSnackMesage(data.message ?? 'Inventory created successfully', 'btn-success');
        }
        return data;
      }),
      catchError(error => {
        this.setLoadStatus(false);
        this.setSnackMesage('Error creating inventory', 'btn-danger');
        throw error;
      })
    );
  }

  updateInventory(inventoryId: string, formData: FormGroup): Observable<any> {
    const header = this.getHearder();
    this.setLoadStatus(true);
    
    return this.http.put<ApiResponse<any>>(`${environment.apiUrlFirst}/admin/inventories/update/${inventoryId}`, formData.value, header).pipe(
      map(data => {
        this.setLoadStatus(false);
        if (data.success) {
          this.setSnackMesage(data.message ?? 'Inventory updated successfully', 'btn-success');
        }
        return data;
      }),
      catchError(error => {
        this.setLoadStatus(false);
        this.setSnackMesage('Error updating inventory', 'btn-danger');
        throw error;
      })
    );
  }

  deleteInventory(inventoryId: string): Observable<any> {
    const header = this.getHearder();
    this.setLoadStatus(true);
    
    return this.http.delete<ApiResponse<any>>(`${environment.apiUrlFirst}/admin/inventories/${inventoryId}`, header).pipe(
      map(data => {
        this.setLoadStatus(false);
        if (data.success) {
          this.setSnackMesage(data.message ?? 'Inventory deleted successfully', 'btn-success');
        }
        return data;
      }),
      catchError(error => {
        this.setLoadStatus(false);
        this.setSnackMesage('Error deleting inventory', 'btn-danger');
        throw error;
      })
    );
  }

  closeInventory(inventoryId: string) {
    const header = this.getHearder();
    this.setLoadStatus(true);
    
    return this.http.post<ApiResponse<any>>(`${environment.apiUrlFirst}/admin/inventories/close/${inventoryId}`, {}, header).pipe(
      map(data => {
        this.setLoadStatus(false);
        if (data.success) {
          this.setSnackMesage(data.message ?? 'Inventory closed successfully', 'btn-success');
        }
        return data;
      }),
      catchError(error => {
        this.setLoadStatus(false);
        this.setSnackMesage('Error closing inventory', 'btn-danger');
        throw error;
      })
    ).subscribe();
  }

  // Missing Inventories Methods
  getMissingInventoriesFromServer(paginateD: PaginateData = this.emptyPaginate, searchOptions: searchOption[] = []) {
    const header = this.getHearder();
    let pagin = this.explosePaginationOption(paginateD);
    let search = exploseSearchOption(searchOptions);
    pagin += search ? `&${search}` : '';
    this.setLoadStatus(true);
    
    this.http.get<ApiPaginatedResponse<MissingInventoryDetail>>(`${environment.apiUrlFirst}/admin/inventorie-missings/all?${pagin}`, header).pipe(
      map(data => {
        this.setLoadStatus(false);
        console.log('Missing Inventories data:', data);
        this._missingInventories$.next(data.data?.data ?? []);
        this._paginateData$.next({
          current_page: data.data?.current_page ?? 1,
          per_page: data.data?.per_page ?? 1,
          total: data.data?.total ?? 1,
        });
      }),
      catchError(error => {
        this.setLoadStatus(false);
        this.setSnackMesage('Error loading missing inventories', 'btn-danger');
        return of([]);
      })
    ).subscribe();
  }

  getMissingInventoryDetailFromServer(missingInventoryId: string): Observable<MissingInventoryDetail> {
    const header = this.getHearder();
    this.setLoadStatus(true);
    
    return this.http.get<ApiResponse<MissingInventoryDetail>>(`${environment.apiUrlFirst}/admin/inventorie-missings/${missingInventoryId}`, header).pipe(
      map(data => {
        this.setLoadStatus(false);
        return data.data!;
      }),
      catchError(error => {
        this.setLoadStatus(false);
        this.setSnackMesage('Error loading missing inventory details', 'btn-danger');
        throw error;
      })
    );
  }

  createMissingInventory(formData: FormData) {
    const header = this.getHearder();
    this.setLoadStatus(true);
    
     this.http.post<ApiResponse<MissingInventoryDetail>>(`${environment.apiUrlFirst}/admin/inventorie-missings/create`, formData, header).pipe(
      map(data => {
        this.setLoadStatus(false);
        this.setConfirmSubmit(true);
        if (data.success) {
          this.setSnackMesage(data.message ?? 'Missing inventory created successfully', 'btn-success');
        }
        return data;
      }),
      catchError(error => {
        this.setLoadStatus(false);
        this.setSnackMesage('Error creating missing inventory', 'btn-danger');
        throw error;
      })
    ).subscribe();
  }

  updateMissingInventory(missingInventoryId: string, formData: FormData) {
    const header = this.getHearder();
    this.setLoadStatus(true);

     this.http.put<ApiResponse<MissingInventoryDetail>>(`${environment.apiUrlFirst}/admin/inventorie-missings/update/${missingInventoryId}`, formData, header).pipe(
      map(data => {
        this.setLoadStatus(false);
        this.setConfirmSubmit(true);
        if (data.success) {
          this.setSnackMesage(data.message ?? 'Missing inventory updated successfully', 'btn-success');
        }
        return data;
      }),
      catchError(error => {
        this.setLoadStatus(false);
        this.setSnackMesage('Error updating missing inventory', 'btn-danger');
        throw error;
      })
    ).subscribe();
  }

  deleteMissingInventory(missingInventoryId: string): Observable<any> {
    const header = this.getHearder();
    this.setLoadStatus(true);
    
    return this.http.delete<ApiResponse<any>>(`${environment.apiUrlFirst}/admin/inventorie-missings/${missingInventoryId}`, header).pipe(
      map(data => {
        this.setLoadStatus(false);
        if (data.success) {
          this.setSnackMesage(data.message ?? 'Missing inventory deleted successfully', 'btn-success');
        }
        return data;
      }),
      catchError(error => {
        this.setLoadStatus(false);
        this.setSnackMesage('Error deleting missing inventory', 'btn-danger');
        throw error;
      })
    );
  }

  // Broken Inventories Methods
  getBrokenInventoriesFromServer(paginateD: PaginateData = this.emptyPaginate, searchOptions: searchOption[] = []) {
    const header = this.getHearder();
    let pagin = this.explosePaginationOption(paginateD);
    let search = exploseSearchOption(searchOptions);
    pagin += search ? `&${search}` : '';
    this.setLoadStatus(true);
    
    this.http.get<ApiPaginatedResponse<BrokenInventoryDetail>>(`${environment.apiUrlFirst}/admin/inventorie-brokens/all?${pagin}`, header).pipe(
      map(data => {
        this.setLoadStatus(false);
        console.log('Broken Inventories data:', data);
        this._brokenInventories$.next(data.data?.data ?? []);
        this._paginateData$.next({
          current_page: data.data?.current_page ?? 1,
          per_page: data.data?.per_page ?? 1,
          total: data.data?.total ?? 1,
        });
      }),
      catchError(error => {
        this.setLoadStatus(false);
        this.setSnackMesage('Error loading broken inventories', 'btn-danger');
        return of([]);
      })
    ).subscribe();
  }

  getBrokenInventoryDetailFromServer(brokenInventoryId: string): Observable<BrokenInventoryDetail> {
    const header = this.getHearder();
    this.setLoadStatus(true);
    
    return this.http.get<ApiResponse<BrokenInventoryDetail>>(`${environment.apiUrlFirst}/admin/inventorie-brokens/${brokenInventoryId}`, header).pipe(
      map(data => {
        this.setLoadStatus(false);
        return data.data!;
      }),
      catchError(error => {
        this.setLoadStatus(false);
        this.setSnackMesage('Error loading broken inventory details', 'btn-danger');
        throw error;
      })
    );
  }

  createBrokenInventory(formData: FormData) {
    const header = this.getHearder();
    this.setLoadStatus(true);
    
     this.http.post<ApiResponse<BrokenInventoryDetail>>(`${environment.apiUrlFirst}/admin/inventorie-brokens/create`, formData, header).pipe(
      map(data => {
        this.setLoadStatus(false);
        this.setConfirmSubmit(true);
        if (data.success) {
          this.setSnackMesage(data.message ?? 'Broken inventory created successfully', 'btn-success');
        }else{

          this.setSnackMesage(data.message, 'btn-danger');
        }
        return data;
      }),
      catchError(error => {
        this.setLoadStatus(false);
        this.setSnackMesage(error.message, 'btn-danger');
        throw error;
      })
    ).subscribe();
  }

  updateBrokenInventory(brokenInventoryId: string, formData: FormData) {
    const header = this.getHearder();
    this.setLoadStatus(true);

     this.http.put<ApiResponse<BrokenInventoryDetail>>(`${environment.apiUrlFirst}/admin/inventorie-brokens/update/${brokenInventoryId}`, formData, header).pipe(
      map(data => {
        this.setLoadStatus(false);
        this.setConfirmSubmit(true);
        if (data.success) {
          this.setSnackMesage(data.message ?? 'Broken inventory updated successfully', 'btn-success');
        }else{
          this.setSnackMesage(data.message, 'btn-danger');
        }
        return data;
      }),
      catchError(error => {
        this.setLoadStatus(false);
        this.setSnackMesage(error.message, 'btn-danger');
        throw error;
      })
    ).subscribe();
  }

  deleteBrokenInventory(brokenInventoryId: string): Observable<any> {
    const header = this.getHearder();
    this.setLoadStatus(true);
    
    return this.http.delete<ApiResponse<any>>(`${environment.apiUrlFirst}/admin/inventorie-brokens/${brokenInventoryId}`, header).pipe(
      map(data => {
        this.setLoadStatus(false);
        if (data.success) {
          this.setSnackMesage(data.message ?? 'Broken inventory deleted successfully', 'btn-success');
        }
        return data;
      }),
      catchError(error => {
        this.setLoadStatus(false);
        this.setSnackMesage('Error deleting broken inventory', 'btn-danger');
        throw error;
      })
    );
  }

  // Méthode pour obtenir les inventaires actifs (pour le dropdown)
  getActiveInventoriesFromServer(): Observable<InventoryDetail[]> {
    const header = this.getHearder();
    
    return this.http.get<ApiResponse<InventoryDetail[]>>(`${environment.apiUrlFirst}/admin/inventories/active`, header).pipe(
      map(data => {
        return data.data ?? [];
      }),
      catchError(error => {
        this.setSnackMesage('Error loading active inventories', 'btn-danger');
        return of([]);
      })
    );
  }
}
