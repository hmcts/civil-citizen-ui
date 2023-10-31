import {Request} from 'express';
import {Session} from 'express-session';
import {Claim} from './claim';

import {TaskList} from 'common/models/taskList/taskList';

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
  previousUrl: string;
  claimId: string;
  taskLists: TaskList[];
  assignClaimId: string;
  claimIssueTasklist: boolean;
}

export interface UserDetails {
  accessToken: string;
  id: string;
  email: string;
  givenName: string;
  familyName: string;
  roles: string[];
}

