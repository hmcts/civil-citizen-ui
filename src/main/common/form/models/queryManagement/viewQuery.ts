import {YesNoUpperCamelCase} from 'form/models/yesNo';

export class ViewObjects {
  id: string;
  createdBy: string;
  subject: string;
  sentOn: string;
  lastUpdatedBy: string;
  lastUpdatedOn: string;
  status: string;

  constructor(id: string, createdBy: string, subject: string, sentOn: string, lastUpdatedBy: string, lastUpdatedOn: string, status: string) {
    this.id = id;
    this.createdBy = createdBy;
    this.subject = subject;
    this.sentOn = sentOn;
    this.lastUpdatedBy = lastUpdatedBy;
    this.lastUpdatedOn = lastUpdatedOn;
    this.status = status;
  }
}

export class FormattedDocument {
  fileName: string;
  documentUrl: string;

  constructor(fileName: string, documentUrl: string) {
    this.fileName = fileName;
    this.documentUrl = documentUrl;
  }
}

export class QueryListItem {
  messageDetails: string;
  isHearingRelated: YesNoUpperCamelCase;
  hearingDate?: string;
  documents: FormattedDocument[];
  sentBy: string;
  sentOn: string;

  constructor(messageDetails: string, isHearingRelated: YesNoUpperCamelCase, documents: FormattedDocument[], sentBy: string, sentOn: string, hearingDate?: string ) {
    this.messageDetails = messageDetails;
    this.isHearingRelated = isHearingRelated;
    this.hearingDate = hearingDate;
    this.documents = documents;
    this.sentBy = sentBy;
    this.sentOn = sentOn;
  }
}

export class QueryDetail {
  title: string;
  lastStatus: string;
  items: QueryListItem[];

  constructor(title: string, lastStatus: string, items: QueryListItem[]) {
    this.title = title;
    this.lastStatus = lastStatus;
    this.items = items;
  }
}
