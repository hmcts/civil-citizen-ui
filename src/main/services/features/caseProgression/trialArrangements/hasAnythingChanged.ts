import {Claim} from 'models/claim';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {CASE_DOCUMENT_DOWNLOAD_URL} from 'routes/urls';
import {DocumentType} from 'models/document/documentType';
import {getSystemGeneratedCaseDocumentIdByType} from 'models/document/systemGeneratedCaseDocuments';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';

export const getHasAnythingChanged = (claimId: string, claim: Claim) => {
  const documentId = getDocumentId(claim, DocumentType.DEFENDANT_DEFENCE);
  return new PageSectionBuilder()
    .addMainTitle('PAGES.HAS_ANYTHING_CHANGED.FINALISE')
    .addLeadParagraph('PAGES.HAS_ANYTHING_CHANGED.CLAIM_NUMBER', {claimId:caseNumberPrettify(claimId)}, 'govuk-!-margin-bottom-0')
    .addLeadParagraph('COMMON.PARTIES', {
      claimantName: claim.getClaimantFullName(),
      defendantName: claim.getDefendantFullName(),
    })
    .addTitle('PAGES.HAS_ANYTHING_CHANGED.HAS_ANYTHING')
    .addLink('PAGES.HAS_ANYTHING_CHANGED.DIRECTIONS',CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', claimId).replace(':documentId', documentId), 'PAGES.HAS_ANYTHING_CHANGED.YOU_CAN')
    .build();

  function getDocumentId(claim:Claim, documentType: DocumentType):string {
    let documentId;
    if (claim.systemGeneratedCaseDocuments?.length > 0) {
      claim.systemGeneratedCaseDocuments.forEach(doc => {
        if (doc.value.documentType == documentType) {
          documentId = getSystemGeneratedCaseDocumentIdByType(claim.systemGeneratedCaseDocuments, documentType);
        }});
      return documentId;
    } else {
      return undefined;
    }
  }
};
