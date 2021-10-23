import { Injectable } from '@angular/core';
import {
  User,
  UserManager,
  UserManagerSettings
} from 'oidc-client';
import { Subject } from 'rxjs';
import { Constants } from '../constants';
import { CoreModule } from './core.module';

@Injectable({ providedIn: CoreModule })
export class AuthService {
  private _userManager: UserManager;
  private _user: User;
  private _loginChangedSubject = new Subject<boolean>();

  loginChanged = this._loginChangedSubject.asObservable();

  constructor() {
    const stsSettings: UserManagerSettings = {
      authority: Constants.stsAuthority,
      client_id: Constants.clientId,
      redirect_uri: `${Constants.clientRoot}signin-callback`,
      scope: 'openid profile projects-api',
      response_type: 'code',
      post_logout_redirect_uri: `${Constants.clientRoot}signout-callback`
    };

    this._userManager = new UserManager(stsSettings);
  }

  login(): Promise<void> {
    return this._userManager.signinRedirect();
  }

  async isLoggedIn(): Promise<boolean> {
    const user = await this._userManager.getUser();

    const isLoggedIn = !!user && !user.expired;

    if (this._user !== user) {
      this._loginChangedSubject.next(isLoggedIn);
    }

    this._user = user;

    return isLoggedIn;
  }
}
