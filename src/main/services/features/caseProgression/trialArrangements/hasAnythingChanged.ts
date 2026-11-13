import {Claim} from 'models/claim';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {CASE_DOCUMENT_DOWNLOAD_URL} from 'routes/urls';
import {DocumentType} from 'models/document/documentType';
import {
  buildSystemGeneratedCaseDocumentUrl,
  getSystemGeneratedCaseDocumentIdByType,
} from 'models/document/systemGeneratedCaseDocuments';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {CaseRole} from 'form/models/caseRoles';
import {DirectionQuestionnaireType} from 'models/directionsQuestionnaire/directionQuestionnaireType';
import {currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';

export const getHasAnythingChanged = (claimId: string, claim: Claim) => {
  const defendantOrClaimant = claim?.caseRole === CaseRole.CLAIMANT
    ? DirectionQuestionnaireType.CLAIMANT
    : DirectionQuestionnaireType.DEFENDANT;

  const documentId = getSystemGeneratedCaseDocumentIdByType(
    claim.systemGeneratedCaseDocuments,
    DocumentType.DIRECTIONS_QUESTIONNAIRE,
    defendantOrClaimant,
  );
  const documentUrl = buildSystemGeneratedCaseDocumentUrl(claimId, documentId, CASE_DOCUMENT_DOWNLOAD_URL);
  return new PageSectionBuilder()
    .addMicroText('PAGES.DASHBOARD.HEARINGS.HEARING')
    .addMainTitle('PAGES.HAS_ANYTHING_CHANGED.FINALISE')
    .addLeadParagraph('COMMON.CASE_NUMBER_PARAM', {claimId:caseNumberPrettify(claimId)}, 'govuk-!-margin-bottom-1')
    .addLeadParagraph('COMMON.CLAIM_AMOUNT_WITH_VALUE', {claimAmount: currencyFormatWithNoTrailingZeros(claim.totalClaimAmount)})
    .addTitle('PAGES.HAS_ANYTHING_CHANGED.HAS_ANYTHING')
    .addDocumentFullStopLinkOrUnavailable('PAGES.HAS_ANYTHING_CHANGED.DIRECTIONS', documentUrl, 'PAGES.HAS_ANYTHING_CHANGED.YOU_CAN')
    .build();
};
