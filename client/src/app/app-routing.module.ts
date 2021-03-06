import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  RedirectToDefaultRouteComponent
} from './shared/_components/redirect-to-default-route/redirect-to-default-route.component';
import { CreateProfileGuardService } from './shared/_guards/create-profile-guard.service';
import { LoginGuard } from './shared/_guards/login-guard.service';

const routes: Routes = [
  { path: '**', redirectTo: '/redirect' }, // redirects to '' in case no route is matched
  { path: 'redirect', component: RedirectToDefaultRouteComponent, canActivate: [LoginGuard, CreateProfileGuardService] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
