import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LogOut } from '../../../models/data-server.model';
import { LanguageService } from '../../../services/language/language.service';
import { MatIconRegistry } from '@angular/material/icon';
import { map, tap } from 'rxjs';

@Component({
  selector: 'app-language',
  standalone: false,
  templateUrl: './language.component.html',
  styleUrl: './language.component.css'
})
export class LanguageComponent {
  readonly languages = [
    { value: 'en', label: 'English', img: 'img/english.png' }, 
    { value: 'fr', label: 'French', img: 'img/french.png'}, 
  ];
  public language = this.languages[0];
  constructor(private languageService:LanguageService,private router :Router,private icon: MatIconRegistry){}
  ngOnInit(): void {
    let lang=this.languageService.getCurrentLanguage();
    this.language = this.languages.find( langs => langs.value === lang)as { value: string, label: string, img: string} ;
  }
  


  selectLanguage(event:any) {
    console.log('un monde de fou : ',event);
    this.languageService.setLanguage(event)
    window.location.reload()
    //this.language = this.languages.find( lang => lang.value === value) as { value: string, label: string, img: string};
  }
  logOut(){
    LogOut();
    this.router.navigateByUrl('/login');
  }
  setEnLanguage(){
    this.languageService.setLanguage('en')
   // window.location.reload()
  }
  setFrLanguage(){
    this.languageService.setLanguage('fr')
    //window.location.reload()
  }
  isLanguage(lang:string):boolean{
    return lang===this.languageService.getCurrentLanguage();
  }
}
