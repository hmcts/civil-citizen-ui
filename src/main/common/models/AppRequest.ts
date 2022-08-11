import { Request } from 'express';
import { Session } from 'express-session';
import { Claim } from './claim';

export interface AppRequest<T = Partial<Claim>> extends Request {
  session: AppSession;
  locals: {
    env: string;
    lang: string;
  };
  body: T;
}

export interface AppSession extends Session {
  user: UserDetails;
  lang: string | undefined;
}

export interface UserDetails {
  accessToken: string;
  idToken: string;
  id: string;
  email: string;
  givenName: string;
  familyName: string;
  roles: string[];
}
