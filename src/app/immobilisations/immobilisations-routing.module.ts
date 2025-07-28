import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListImmobilisationComponent } from './components/list-immobilisation/list-immobilisation.component';
import { ListCategorieComponent } from './components/list-categorie/list-categorie.component';
import { ListStructureComponent } from './components/list-structure/list-structure.component';
import { ListFournisseurComponent } from './components/list-fournisseur/list-fournisseur.component';
import { CreateImmobilisationComponent } from './components/create-immobilisation/create-immobilisation.component';
import { DetailImmobilisationComponent } from './components/detail-immobilisation/detail-immobilisation.component';
import { GenerateCodeBareImmobilisationsComponent } from './components/generate-code-bare-immobilisations/generate-code-bare-immobilisations.component';
import { RoleGuard } from '../guards/role.guard';
import { UserRole } from '../enums/roles.enum';

const routes: Routes = [
  // Lecture accessible à tous les rôles connectés
  {path:'',component:ListImmobilisationComponent},
  {path:'categories',component:ListCategorieComponent},
  {path:'structures',component:ListStructureComponent},
  {path:'fournisseurs',component:ListFournisseurComponent},
  {path:'detail/:id',component:DetailImmobilisationComponent},
  
  // Création/Modification réservée aux Admin et SuperAdmin
  {
    path:'create',
    component:CreateImmobilisationComponent,
    canActivate:[RoleGuard],
    data: { roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] }
  },
  {
    path:'edit/:id',
    component:CreateImmobilisationComponent,
    canActivate:[RoleGuard],
    data: { roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] }
  },
  {
    path:'generate-barcodes',
    component:GenerateCodeBareImmobilisationsComponent,
    canActivate:[RoleGuard],
    data: { roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImmobilisationsRoutingModule { }
