
import {Document} from 'models/document/document';

export class MediationUploadDocumentsCCD {
  id: string;
  value: MediationDocumentsReferred | MediationMediationNonAttendanceDocs;
}

export class MediationDocumentsReferred{
  document: Document;
  documentDate?: Date;
  documentType?: string;
  documentUploadedDatetime: Date;

  constructor(document?: Document, documentDate?: Date, documentType?: string, documentUploadedDatetime?: Date) {
    this.document = document;
    this.documentDate = documentDate;
    this.documentType = documentType;
    this.documentUploadedDatetime = documentUploadedDatetime;
  }
}
export class MediationMediationNonAttendanceDocs{
  document: Document;
  yourName?: string;
  documentDate?: Date;
  documentUploadedDatetime: Date;

  constructor(document?: Document, yourName?: string, documentDate?: Date, documentUploadedDatetime?: Date) {
    this.document = document;
    this.yourName = yourName;
    this.documentDate = documentDate;
    this.documentUploadedDatetime = documentUploadedDatetime;
  }
}
