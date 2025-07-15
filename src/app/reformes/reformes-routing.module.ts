import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListEntrepriseComponent } from './components/entreprise/list-entreprise/list-entreprise.component';
import { CreateEntrepriseComponent } from './components/entreprise/create-entreprise/create-entreprise.component';
import { DetailEntrepriseComponent } from './components/entreprise/detail-entreprise/detail-entreprise.component';

const routes: Routes = [
  {path:'entreprises',component: ListEntrepriseComponent},
  {path:"entreprises/create",component:CreateEntrepriseComponent},
  {path:"entreprises/edit/:id",component:CreateEntrepriseComponent},
  {path:"entreprises/detail/:id",component:DetailEntrepriseComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReformesRoutingModule { }
