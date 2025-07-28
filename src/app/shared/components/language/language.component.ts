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
   currentFlag: string = 'en';
  isOpen = false;

  flags = [
    { code: 'en', img: 'img/english.png', codeFlag: 'English' },
    { code: 'fr', img: 'img/french.png', codeFlag: 'Francais' }
  ];
  constructor(private languageService: LanguageService,private router:Router) {
      // Constructor logic if needed
    }
  ngOnInit(): void {
      this.currentFlag = this.languageService.getCurrentLanguage();
    
  }
    setEnLanguage(){
      this.languageService.setLanguage('en')
      //window.location.reload()
    }
    setFrLanguage(){
      this.languageService.setLanguage('fr')
      //window.location.reload()
    }
    isLanguage(lang:string):boolean{
      return lang===this.languageService.getCurrentLanguage();
    }
    changeFlag(event: any) {
      const selectedLanguage = event.target.value;
      console.log('Selected language:', selectedLanguage);
      this.languageService.setLanguage(selectedLanguage);
      window.location.reload();
    }
  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  selectLanguage(code: string) {
    this.currentFlag = code;
    this.languageService.setLanguage(code);
    this.isOpen = false;
    window.location.reload();
    // ici tu peux ajouter la logique de changement de langue (i18n, etc.)
  }

  get currentFlagUrl(): string {
    return this.flags.find(flag => flag.code === this.currentFlag)?.img || '';
  }
  logOut() {
    LogOut();
    this.router.navigate(['/login']);
  }
}
