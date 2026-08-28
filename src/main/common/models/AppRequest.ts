import {Request} from 'express';
import {Session} from 'express-session';
import {Claim} from './claim';
import {FeeType} from 'common/form/models/helpWithFees/feeType';
import {CaseRole} from 'form/models/caseRoles';

import {TaskList} from 'common/models/taskList/taskList';

/** Short-TTL session entry for /userCaseRoles (DTSCCI-5946). role null = negative cache. */
export interface UserCaseRolesCacheEntry {
  role: CaseRole | null;
  expiresAt: number;
}

export interface AppRequest<T = Partial<Claim>> extends Request {
  session: AppSession;
  locals: {
    env: string;
    lang: string;
    claim?: Claim;
    claimDetailsRequestCache?: Map<string, Promise<Claim>>;
    userCaseRolesRequestCache?: Map<string, Promise<CaseRole | undefined>>;
    calculateInterestRequestCache?: Map<string, Promise<number>>;
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
  breathingSpaceAppliedType?: string;
  breathingSpaceAppliedStart?: string;
  /** Short-TTL session cache for /userCaseRoles (DTSCCI-5946). Key: ucr:userId:caseId */
  userCaseRolesCache?: Record<string, UserCaseRolesCacheEntry>;
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

export interface Dashboard {
  taskIdHearingUploadDocuments: string;
}
