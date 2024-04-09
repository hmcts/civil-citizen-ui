import {formatDateToFullDate} from 'common/utils/dateUtils';
import {MediationAgreementDocuments} from 'models/mediation/document/mediationAgreementDocuments';

export class DocumentLinkInformation{
  url: string;
  text: string;
}
export class DocumentInformation {
  fileName: string;
  uploadDate: string;
  linkInformation: DocumentLinkInformation;

}

export class ViewDocumentsSection {
  title: string;
  documents: DocumentInformation[];

  constructor(viewDocumentsTitle: string, mediationAgreementDocuments: MediationAgreementDocuments[], lang: string) {
    this.title = viewDocumentsTitle;
    this.documents = mediationAgreementDocuments.map((docs) => {
      return {
        fileName: docs.value.documentName,
        uploadDate: formatDateToFullDate(docs.value.createdDatetime, lang),
        linkInformation: {
          url: docs.value.documentLink.document_url,
          text: docs.value.documentLink.document_filename,
        },
      } as DocumentInformation;
    });
  }

}
