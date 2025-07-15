import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListImmobilisationComponent } from './components/list-immobilisation/list-immobilisation.component';
import { ListCategorieComponent } from './components/list-categorie/list-categorie.component';
import { ListStructureComponent } from './components/list-structure/list-structure.component';
import { ListFournisseurComponent } from './components/list-fournisseur/list-fournisseur.component';
import { CreateImmobilisationComponent } from './components/create-immobilisation/create-immobilisation.component';
import { DetailImmobilisationComponent } from './components/detail-immobilisation/detail-immobilisation.component';
import { GenerateCodeBareImmobilisationsComponent } from './components/generate-code-bare-immobilisations/generate-code-bare-immobilisations.component';

const routes: Routes = [
  {path:'',component:ListImmobilisationComponent},
  {path:'categories',component:ListCategorieComponent},
  {path:'structures',component:ListStructureComponent},
  {path:'fournisseurs',component:ListFournisseurComponent},
  {path:'create',component:CreateImmobilisationComponent},
  {path:'detail/:id',component:DetailImmobilisationComponent},
  {path:'edit/:id',component:CreateImmobilisationComponent},
  {path:'generate-barcodes',component:GenerateCodeBareImmobilisationsComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImmobilisationsRoutingModule { }
