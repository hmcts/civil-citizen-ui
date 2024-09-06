import {CaseLink} from 'models/generalApplication/CaseLink';
import {YesNo} from 'form/models/yesNo';

export class ClaimGeneralApplication {
  id?: string;
  value?: ClaimGeneralApplicationValue;
}

export class ClaimGeneralApplicationValue {
  caseLink: CaseLink;
  generalAppSubmittedDateGAspec?: string;
  parentClaimantIsApplicant?: YesNo;
}
