import { AssociateUserProfileComponent } from './associate-user-profile/associate-user-profile.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { LoginGuard } from '../shared/_guards/login-guard.service';
import { UserProfileComponent } from './user-profile.component';
import { ImportUserProfileComponent } from './import-user-profile/import-user-profile.component';
import { CreateProfileGuardService } from '../shared/_guards/create-profile-guard.service'

const routes = [{
  path: 'manage-user-profile',
  component: UserProfileComponent,
  canActivate: [LoginGuard, CreateProfileGuardService]
}, {
  path: 'import-user-profile',
  component: ImportUserProfileComponent,
  canActivate: [LoginGuard]
}, {
  path: 'associate-user-profile',
  component: AssociateUserProfileComponent,
  canActivate: [LoginGuard]
}];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: []
})
export class UserProfileRoutingModule { }
