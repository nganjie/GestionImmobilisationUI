import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { BaseComponent } from '../../../shared/components/base/base.component';
import { LanguageService } from '../../../services/language/language.service';
import { EmployeeService } from '../../services/employee.service';
import { Employeeimmo } from '../../models/employee-immo-detail.model';

@Component({
  selector: 'app-detail-transfer-immo-employee',
  standalone: false,
  templateUrl: './detail-transfer-immo-employee.component.html',
  styleUrl: './detail-transfer-immo-employee.component.css'
})
export class DetailTransferImmoEmployeeComponent extends BaseComponent implements OnInit {
  loading$!: Observable<boolean>;
  transfer$!: Observable<Employeeimmo | null>;
  transferId!: string;

  constructor(
    private languageService: LanguageService,
    private employeeService: EmployeeService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.loading$ = this.employeeService.loading$;
    
    // Get transfer ID from route params
    this.route.params.subscribe(params => {
      this.transferId = params['id'];
      if (this.transferId) {
        this.loadTransferDetail();
      }
    });
  }

  loadTransferDetail(): void {
    this.transfer$ = this.employeeService.getTransferDetailFromServer(this.transferId);
    this.transfer$.subscribe()
  }

  goBack(): void {
    this.router.navigate(['/admin/employees/transfers']);
  }

  editTransfer(): void {
    this.router.navigate(['/admin/employees/transfers/edit', this.transferId]);
  }
}
