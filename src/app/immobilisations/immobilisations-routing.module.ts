import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListImmobilisationComponent } from './components/list-immobilisation/list-immobilisation.component';
import { ListCategorieComponent } from './components/list-categorie/list-categorie.component';
import { ListStructureComponent } from './components/list-structure/list-structure.component';
import { ListFournisseurComponent } from './components/list-fournisseur/list-fournisseur.component';

const routes: Routes = [
  {path:'',component:ListImmobilisationComponent},
  {path:'categories',component:ListCategorieComponent},
  {path:'structures',component:ListStructureComponent},
  {path:'fournisseurs',component:ListFournisseurComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImmobilisationsRoutingModule { }
