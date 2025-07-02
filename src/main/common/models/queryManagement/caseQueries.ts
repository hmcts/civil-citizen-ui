import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {Document} from 'models/document/document';
import {GenericYesNo} from 'form/models/genericYesNo';

export interface CaseQueries {
  caseMessages: QueryMessage[];
  partyName: string;
  roleOnCase?: string;
}

export interface QueryMessage {
  id?: string;
  value: CaseMessage;
}

export interface CaseMessage {
  id?: string;
  subject: string;
  name: string;
  body: string;
  attachments?: FormDocument[];
  isHearingRelated: YesNoUpperCamelCase;
  hearingDate?: string;
  createdOn: string;
  createdBy: string;
  parentId?: string;
  isClosed?: GenericYesNo;
}

export interface FormDocument {
  id?: string;
  value?: Document;
}
