import {formatDateToFullDate} from 'common/utils/dateUtils';
import {MediationAgreement} from 'models/mediation/mediationAgreement';
import {CASE_DOCUMENT_VIEW_URL} from 'routes/urls';
import {documentIdExtractor} from 'common/utils/stringUtils';

export interface DocumentLinkInformation{
  url: string;
  text: string;
}

export interface DocumentInformation {
  fileName: string;
  uploadDate: string;
  linkInformation: DocumentLinkInformation;

}

export class ViewDocumentsSection {
  title: string;
  documents: DocumentInformation[];

  constructor(viewDocumentsTitle: string, mediationAgreement: MediationAgreement, mediationSettlementAgreedAt: Date, claimId: string,  lang: string) {
    this.title = viewDocumentsTitle;
    this.documents = Array.of(
      {
        fileName: mediationAgreement.name,
        uploadDate: formatDateToFullDate(mediationSettlementAgreedAt, lang),
        linkInformation: {
          url: CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId', documentIdExtractor(mediationAgreement.document.document_binary_url)),
          text: mediationAgreement.document.document_filename,
        },
      } as DocumentInformation);
  }

}
