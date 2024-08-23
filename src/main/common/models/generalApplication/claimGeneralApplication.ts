import {CaseLink} from 'models/generalApplication/CaseLink';

export class ClaimGeneralApplication {
  id?: string;
  value?: ClaimGeneralApplicationValue;
}

export class ClaimGeneralApplicationValue {
  caseLink: CaseLink;
}
