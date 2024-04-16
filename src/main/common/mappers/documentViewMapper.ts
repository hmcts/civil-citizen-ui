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
import {getSystemGeneratedCaseDocumentIdByType} from 'models/document/systemGeneratedCaseDocuments';
import {DocumentType} from 'models/document/documentType';

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
            getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, DocumentType.DEFENDANT_DEFENCE)),
        `defendant-response-${caseId}.pdf`))));
}
