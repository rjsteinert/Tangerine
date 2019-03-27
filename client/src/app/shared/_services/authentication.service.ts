import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AppConfigService } from './app-config.service';
import { UserService } from './user.service';

@Injectable()
export class AuthenticationService {

  public currentUserLoggedIn$: any;
  private _currentUserLoggedIn: boolean;
  public userShouldResetPassword$: any;
  private _userShouldResetPassword: boolean;

  constructor(
    private userService: UserService,
    private appConfigService: AppConfigService
  ) {
    this.currentUserLoggedIn$ = new Subject();
    this.userShouldResetPassword$ = new Subject();
  }

  async login(username: string, password: string) {
    if (await this.userService.doesUserExist(username) && await this.confirmPassword(username, password)) {
      localStorage.setItem('currentUser', username);
      this._currentUserLoggedIn = true;
      this.currentUserLoggedIn$.next(this._currentUserLoggedIn);
      return true 
    } else {;
      return false
    }
  }

  async resetPassword(user) {
    const userExists = await this.userService.doesUserExist(user.username);
    const doesAnswerMatch = await this.confirmSecurityQuestion(user);
    if (
      userExists &&
      doesAnswerMatch &&
      (await this.userService.changeUserPassword(user))
    ) {
      localStorage.setItem('currentUser', user.username);
      this._currentUserLoggedIn = true;
      this.currentUserLoggedIn$.next(this._currentUserLoggedIn);
      return true;
    } else {
      return false;
    }
  }

  async confirmPassword(username, password):Promise<boolean> {
    const userAccount = await this.userService.getUserAccount(username)
    return this.userService.hashValue(password) === userAccount.password
      ? true
      : false
  }

  async confirmSecurityQuestion(user):Promise<boolean> {
    const userAccount = await this.userService.getUserAccount(user.username)
    return this.userService.hashValue(user.securityQuestionResponse) === userAccount.securityQuestionResponse
      ? true
      : false
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this._currentUserLoggedIn = false;
    this.currentUserLoggedIn$.next(this._currentUserLoggedIn);
  }

  isLoggedIn() {
    this._currentUserLoggedIn = false;
    this._currentUserLoggedIn = !!localStorage.getItem('currentUser');
    this.currentUserLoggedIn$.next(this._currentUserLoggedIn);
    return this._currentUserLoggedIn;

  }

  shouldResetPassword() {
    this._userShouldResetPassword = false;
    this._userShouldResetPassword = !!localStorage.getItem('userShouldResetPassword');
    this.userShouldResetPassword$.next(this._userShouldResetPassword);
    return this._userShouldResetPassword;
  }

  async getSecurityPolicy() {
    const appConfig = await this.appConfigService.getAppConfig();
    return appConfig.securityPolicy;
  }

  async isNoPasswordMode() {
    const policy = await this.getSecurityPolicy();
    const isNoPasswordMode = await policy.find(p => p === 'noPassword');
    return isNoPasswordMode === 'noPassword';
  }

  getCurrentUser() {
    return localStorage.getItem('currentUser');
  }

  getCurrentUserDBPath() {
    return localStorage.getItem('currentUser');
  }
}
