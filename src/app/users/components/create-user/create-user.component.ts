import { Component, EventEmitter, OnInit, Optional, Output, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { ErrorServer } from '../../../models/error-server.model';
import { LanguageService } from '../../../services/language/language.service';
import { UserService } from '../../services/user.service';
import { User, Role } from '../../../models/user.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-create-user',
  standalone: false,
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.css'
})
export class CreateUserComponent implements OnInit {
  @Output() reload = new EventEmitter<boolean>();
  @Input() userToEdit?: User; // User à éditer si fourni
  
  userId?: string;
  loading$!: Observable<boolean>;
  userForm!: FormGroup;
  roles$!: Observable<Role[]>;
  btnSubmit = false;
  error$!: Observable<ErrorServer>;
  confirmSubmit$!: Observable<boolean>;
  isEditMode = false;

  constructor(
    private languageService: LanguageService,
    @Optional() private readonly activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') || this.userToEdit?.id;
    this.isEditMode = !!this.userId || !!this.userToEdit;
    
    this.loading$ = this.userService.loading$;
    this.roles$ = this.userService.roles$;
    this.confirmSubmit$ = this.userService.confirmSubmit$;
    this.error$ = this.userService.error$;

    this.initForm();
    this.loadData();

    // Si on édite un utilisateur passé en input
    if (this.userToEdit) {
      this.populateForm(this.userToEdit);
    }

    // Subscribe to form submission confirmation
    this.confirmSubmit$.subscribe(confirmed => {
      if (confirmed) {
        if (this.activeModal) {
          this.activeModal.close();
        } else {
          this.router.navigate(['/admin/users']);
        }
        this.reload.emit(true);
      }
    });
  }

  initForm(): void {
    // En mode édition, les mots de passe ne sont pas requis
    const passwordValidators = this.isEditMode ? [] : [Validators.required];
    const passwordConfirmationValidators = this.isEditMode ? [] : [Validators.required];

    this.userForm = this.formBuilder.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', passwordValidators],
      password_confirmation: ['', passwordConfirmationValidators],
      is_admin: [0, [Validators.required]],
      role_id: ['', [Validators.required]]
    }, { validators: this.isEditMode ? null : this.passwordMatchValidator });
  }

  loadData(): void {
    // Load roles
    this.userService.getRolesFromServer();
  }

  populateForm(user: User): void {
    this.userForm.patchValue({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      is_admin: user.is_admin,
      role_id: user.roles && user.roles.length > 0 ? user.roles[0].id : ''
    });
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const passwordConfirmation = control.get('password_confirmation');
    
    if (password && passwordConfirmation && password.value !== passwordConfirmation.value) {
      return { 'passwordMismatch': true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.btnSubmit = true;
      if (this.isEditMode && (this.userId || this.userToEdit?.id)) {
        // Update user
        this.userService.updateUser(this.userForm.value, this.userId || this.userToEdit!.id);
      } else {
        // Create user
        this.userService.createUser(this.userForm.value);
      }
    } else {
      this.markFormGroupTouched(this.userForm);
    }
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  closeModal(): void {
    if (this.activeModal) {
      this.activeModal.dismiss();
    } else {
      this.router.navigate(['/admin/users']);
    }
  }

  // Getters pour les contrôles de formulaire
  get firstNameCtrl() { return this.userForm.get('first_name'); }
  get lastNameCtrl() { return this.userForm.get('last_name'); }
  get emailCtrl() { return this.userForm.get('email'); }
  get passwordCtrl() { return this.userForm.get('password'); }
  get passwordConfirmationCtrl() { return this.userForm.get('password_confirmation'); }
  get isAdminCtrl() { return this.userForm.get('is_admin'); }
  get roleCtrl() { return this.userForm.get('role_id'); }
}
