import {MediationAgreement} from 'models/mediation/mediationAgreement';
import {
  DocumentInformation,
  DocumentLinkInformation,
  DocumentsViewComponent,
} from 'form/models/documents/DocumentsViewComponent';
import {CASE_DOCUMENT_VIEW_URL} from 'routes/urls';
import {documentIdExtractor} from 'common/utils/stringUtils';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {
  MediationMediationNonAttendanceDocs,
  MediationUploadDocumentsCCD,
} from 'models/mediation/uploadDocuments/uploadDocumentsCCD';

export const mapperMediationAgreementToDocumentView = (documentTitle: string, mediationAgreement: MediationAgreement, mediationSettlementAgreedAt: Date, claimId: string, lang: string) => {

  return new DocumentsViewComponent(documentTitle, Array.of(
    new DocumentInformation(
      mediationAgreement.name,
      formatDateToFullDate(mediationSettlementAgreedAt, lang),
      new DocumentLinkInformation(
        CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId',
          documentIdExtractor(mediationAgreement.document.document_binary_url)),
        mediationAgreement.document.document_filename))));
};

export const mapperMediationDocumentsReferredToDocumentView = (documentTitle: string, mediationDocuments: MediationUploadDocumentsCCD[] , claimId: string, lang: string) => {

  return new DocumentsViewComponent(documentTitle,
    mediationDocuments.map((item) => {
      return new DocumentInformation(
        !(item.value instanceof MediationMediationNonAttendanceDocs) ? item.value.documentType : item.value.yourName,
        formatDateToFullDate(item.value.documentDate, lang),
        new DocumentLinkInformation(
          CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId',
            documentIdExtractor(item.value.document.document_binary_url)),
          item.value.document.document_filename));
    }),
  );

};
