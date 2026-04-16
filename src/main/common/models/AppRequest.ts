import {Request} from 'express';
import {Session} from 'express-session';
import {Claim} from './claim';
import {FeeType} from 'common/form/models/helpWithFees/feeType';

import {TaskList} from 'common/models/taskList/taskList';

export interface AppRequest<T = Partial<Claim>> extends Request {
  session: AppSession;
  locals: {
    env: string;
    lang: string;
  };
  body: T;
}

export interface FirstContact {
  claimId?: string;
  claimReference?: string;
  pin?: string;
}

export interface PaymentConfirmationContext {
  claimId: string;
  feeType: FeeType;
}

export interface AppSession extends Session {
  user: UserDetails;
  lang: string | undefined;
  previousUrl: string;
  claimId: string;
  taskLists: TaskList[];
  assignClaimURL: string;
  claimIssueTasklist: boolean;
  firstContact: FirstContact;
  fileUpload: string;
  fileUploadSource?: string;
  issuedAt: number;
  dashboard: Dashboard;
  history?: string[];
  qmShareConfirmed: boolean;
  caseReference?: string;
  paymentConfirmationContext?: PaymentConfirmationContext;
  uploadRateLimit?: {
    windowStartMs: number;
    requestCount: number;
  };
}

export interface UserDetails {
  accessToken: string;
  id: string;
  email: string;
  givenName: string;
  familyName: string;
  roles: string[];
}

export interface Dashboard {
  taskIdHearingUploadDocuments: string;
}
