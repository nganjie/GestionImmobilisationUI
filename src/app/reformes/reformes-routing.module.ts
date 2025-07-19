import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListEntrepriseComponent } from './components/entreprise/list-entreprise/list-entreprise.component';
import { CreateEntrepriseComponent } from './components/entreprise/create-entreprise/create-entreprise.component';
import { ListBuyerComponent } from './components/buyer/list-buyer/list-buyer.component';
import { ListReformeBrokenComponent } from './components/broken/list-reforme-broken/list-reforme-broken.component';
import { CreateReformeBrokenComponent } from './components/broken/create-reforme-broken/create-reforme-broken.component';
import { DetailReformeBrokenComponent } from './components/broken/detail-reforme-broken/detail-reforme-broken.component';
import { ListReformeCessionComponent } from './components/cession/list-reforme-cession/list-reforme-cession.component';
import { CreateReformeCessionComponent } from './components/cession/create-reforme-cession/create-reforme-cession.component';
import { DetailReformeCessionComponent } from './components/cession/detail-reforme-cession/detail-reforme-cession.component';
import { ListReformeSaleComponent } from './components/sale/list-reforme-sale/list-reforme-sale.component';
import { CreateReformeSaleComponent } from './components/sale/create-reforme-sale/create-reforme-sale.component';
import { DetailReformeSaleComponent } from './components/sale/detail-reforme-sale/detail-reforme-sale.component';

const routes: Routes = [
  {path:'entreprises',component: ListEntrepriseComponent},
  {path:"entreprises/create",component:CreateEntrepriseComponent},
  {path:"entreprises/edit/:id",component:CreateEntrepriseComponent},
  {path:"buyers",component: ListBuyerComponent},
  {path:"buyers/create",component:CreateEntrepriseComponent},
  {path:"buyers/edit/:id",component:CreateEntrepriseComponent},
  {path:"brokens",component:ListReformeBrokenComponent},
  {path:"brokens/create",component:CreateReformeBrokenComponent},
  {path:"brokens/edit/:id",component:CreateReformeBrokenComponent},
  {path:"brokens/detail/:id",component:DetailReformeBrokenComponent},
  {path:"cessions",component:ListReformeCessionComponent},
  {path:"cessions/create",component:CreateReformeCessionComponent},
  {path:"cessions/detail/:id",component:DetailReformeCessionComponent},
  {path:"sales",component:ListReformeSaleComponent},
  {path:"sales/create",component:CreateReformeSaleComponent},
  {path:"sales/detail/:id",component:DetailReformeSaleComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReformesRoutingModule { }
