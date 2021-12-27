import { Injectable } from '@angular/core';
import {
  SignoutResponse,
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
      /* metadata: {
        issuer: Constants.stsAuthority,
        authorization_endpoint: `${Constants.stsAuthority}authorize?audience=projects-api`,
        jwks_uri: `${Constants.stsAuthority}.well-known/jwks.json`,
        token_endpoint: `${Constants.stsAuthority}oauth/token`,
        userinfo_endpoint: `${Constants.stsAuthority}userinfo`,
        end_session_endpoint:
          `${Constants.stsAuthority}v2/logout?client_id=${Constants.clientId}&returnTo=${Constants.clientRoot}signout-callback`
      } */
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

  async completeLogin(): Promise<User> {
    const user =
      await this._userManager.signinRedirectCallback();

    this._user = user;

    this._loginChangedSubject.next(
      !!user && !user.expired
    );

    return user;
  }

  logout(): void {
    this._userManager.signoutRedirect();
  }

  completeLogout(): Promise<SignoutResponse> {
    this._user = null;

    return this._userManager.signoutRedirectCallback();
  }
}
