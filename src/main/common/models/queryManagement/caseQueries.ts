import {CaseDocument} from 'models/document/caseDocument';
import {YesNoUpperCamelCase} from 'form/models/yesNo';

export interface CaseQueries {
  caseMessageCollection: CaseMessage[];
  partyName: string;
  roleOnCase: string;
}

export interface CaseMessage {
  id: string;
  subject: string;
  name: string;
  body: string;
  attachments?: CaseDocument[];
  isHearingRelated: YesNoUpperCamelCase;
  hearingDate?: Date;
  createdOn: number;
  createdBy: string;
  parentId?: string;
}
