import {CaseDocument} from 'models/document/caseDocument';
import {YesNoUpperCamelCase} from 'form/models/yesNo';

export interface CaseQueries {
  caseMessages: QueryMessage[];
  partyName: string;
  roleOnCase: string;
}

export interface QueryMessage {
  id: string;
  value: CaseMessage;
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
