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
  MediationUploadDocumentsCCD,
} from 'models/mediation/uploadDocuments/uploadDocumentsCCD';
import {
  isMediationDocumentsReferred,
  isMediationNonAttendanceDocs,
} from 'services/features/document/mediation/mediationDocumentService';

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

export const mapperMediationDocumentsToDocumentView = (documentTitle: string, mediationDocuments: MediationUploadDocumentsCCD[] , claimId: string, lang: string) => {
  if (mediationDocuments.length > 0){
    return new DocumentsViewComponent(documentTitle,
      mediationDocuments.map((item) => {
        let fileName: string;
        if (isMediationNonAttendanceDocs(item.value)){
          fileName = item.value.yourName;
        } else  if (isMediationDocumentsReferred(item.value)){
          fileName = item.value.documentType;
        }
        return new DocumentInformation(
          fileName,
          formatDateToFullDate(item.value.documentUploadedDatetime, lang),
          new DocumentLinkInformation(
            CASE_DOCUMENT_VIEW_URL.replace(':id', claimId).replace(':documentId',
              documentIdExtractor(item.value.document.document_binary_url)),
            item.value.document.document_filename));
      }),
    );
  }
};
