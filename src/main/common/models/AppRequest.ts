import { Request } from 'express';
import { Session } from 'express-session';
import type { LoggerInstance } from 'winston';
import { Claim } from './claim';

export interface AppRequest<T = Partial<Claim>> extends Request {
  session: AppSession;
  locals: {
    env: string;
    lang: string;
    logger: LoggerInstance;
  };
  body: T;
}

export interface AppSession extends Session {
  user: UserDetails;
  isApplicant2: boolean;
  lang: string | undefined;
}

export interface UserDetails {
  accessToken: string;
  id: string;
  email: string;
  givenName: string;
  familyName: string;
  roles: string[];
}
