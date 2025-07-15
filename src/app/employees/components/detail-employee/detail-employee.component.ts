import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { EmployeeDetail } from '../../models/employee-detail.model';
import { EmployeeService } from '../../services/employee.service';
import { ActivatedRoute } from '@angular/router';
import { LanguageService } from '../../../services/language/language.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddImmobilisationToEmployeeComponent } from '../add-immobilisation-to-employee/add-immobilisation-to-employee.component';

@Component({
  selector: 'app-detail-employee',
  standalone: false,
  templateUrl: './detail-employee.component.html',
  styleUrl: './detail-employee.component.css'
})
export class DetailEmployeeComponent implements OnInit {
  loading$!: Observable<boolean>;
  employeeId?: string;
  employeeDetail$!: Observable<EmployeeDetail>;
constructor(private employeeService: EmployeeService,private route:ActivatedRoute, private languageService: LanguageService, private modalService: NgbModal) {}
  ngOnInit(): void {
    this.loading$ = this.employeeService.loading$;
    this.employeeId = this.route.snapshot.paramMap.get('id') || undefined;
    if (this.employeeId) {
      this.employeeDetail$ = this.employeeService.getEmployeeDetailFromServer(this.employeeId);
    }
  }

  // Ouvrir le modal d'assignation d'immobilisations
  openAssignImmobilisationModal(): void {
    if (this.employeeId) {
      const modalRef = this.modalService.open(AddImmobilisationToEmployeeComponent, {
       size: 'xl',
        backdrop: 'static',
        keyboard: false,
        centered: true
      });
      modalRef.componentInstance.employeeId = this.employeeId;
      let reload:Observable<boolean>= modalRef.componentInstance.reload 
      reload.subscribe(
        (b)=>{
          if(b){
            this.employeeDetail$ = this.employeeService.getEmployeeDetailFromServer(this.employeeId!);
          }
        }
      )
      modalRef.result.then((result) => {
        if (result) {
          // Recharger les détails de l'employé après assignation
          this.employeeDetail$ = this.employeeService.getEmployeeDetailFromServer(this.employeeId!);
        }
      }).catch((error) => {
        // Modal fermé sans action
        console.log('Modal dismissed');
      });
    }
  }
}
