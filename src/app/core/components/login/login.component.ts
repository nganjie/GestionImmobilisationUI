import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { ErrorServer } from '../../../models/error-server.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{
  loginForm!:FormGroup;
  btnSubmit =false;
  userName !:FormControl
  password !:FormControl;
  loading$!:Observable<boolean>;
  loginError!:Observable<boolean>;
  _error$!:Observable<ErrorServer>;
  errorMessage='';
  showPassword = false;

  constructor(private formBuilder:FormBuilder,private authService:AuthService,private router:Router){}
  ngOnInit(): void {
    this.loading$=this.authService.loading$;
    this._error$=this.authService.error$;
    this._error$.subscribe(
      (b)=>{
        if(b.message!=='erreur')
        {
          this.errorMessage=b.message;
        }
      }
    )
    this.userName =this.formBuilder.control('',Validators.required);
    this.password =this.formBuilder.control('',Validators.required)
    this.loginForm=this.formBuilder.group({
      userName:this.userName,
      password:this.password
    })

    this.loginError =this.loginForm.statusChanges.pipe(
      map(status=> status=="INVALID"&&this.loginForm.get('userName')?.value&&this.loginForm.get('password')?.valid)
    )

  }
  getFormErrors(ctrl:AbstractControl|null){
    if(ctrl?.hasError('required')){
      return "ce champ est réquis";
    }else{
      return "ce champ contient une erreurs"
    }
  }
  onSubmit():void{
    this.btnSubmit=true
    this.authService.autentificate(this.userName.value,this.password.value);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    const passwordInput = document.getElementById('passwordInput') as HTMLInputElement;
    if (passwordInput) {
      passwordInput.type = this.showPassword ? 'text' : 'password';
    }
  }
}
