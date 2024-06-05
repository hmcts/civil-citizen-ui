import {MediationAgreement} from 'models/mediation/mediationAgreement';
import {
  DocumentInformation,
  DocumentLinkInformation,
  DocumentsViewComponent,
} from 'form/models/documents/DocumentsViewComponent';
import {CASE_DOCUMENT_VIEW_URL} from 'routes/urls';
import {documentIdExtractor} from 'common/utils/stringUtils';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {Claim} from 'models/claim';
import {getSystemGeneratedCaseDocumentIdByType,
  SystemGeneratedCaseDocuments} from 'models/document/systemGeneratedCaseDocuments';
import {DocumentType} from 'models/document/documentType';
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

export const mapperDefendantResponseToDocumentView = (documentTitle: string, fileName: string, claim: Claim, claimId: string, lang: string) => {
  const caseId = claim.legacyCaseReference;
  return new DocumentsViewComponent(documentTitle, Array.of(
    new DocumentInformation(
      fileName,
      formatDateToFullDate(claim.respondent1ResponseDate, lang),
      new DocumentLinkInformation(
        CASE_DOCUMENT_VIEW_URL.replace(':id', claimId)
          .replace(':documentId',
            getDocumentId(claim.systemGeneratedCaseDocuments, DocumentType.DEFENDANT_DEFENCE, 'Stitched')),
        `defendant-response-${caseId}.pdf`))));
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

export function getDocumentId(systemGeneratedCaseDocuments: SystemGeneratedCaseDocuments[], documentType: DocumentType, stitchedDoc?: string): string {
  let documentId;
  if (systemGeneratedCaseDocuments?.length > 0) {
    systemGeneratedCaseDocuments.forEach(doc => {
      if (doc.value.documentType == documentType) {
        if (doc.value.documentName.startsWith(stitchedDoc)) {
          documentId = documentIdExtractor(doc.value?.documentLink?.document_binary_url);
        }
      }
    });
    if(documentId === undefined) {
      documentId = getSystemGeneratedCaseDocumentIdByType(systemGeneratedCaseDocuments, documentType);
    }
    return documentId;
  } else {
    return undefined;
  }
}
