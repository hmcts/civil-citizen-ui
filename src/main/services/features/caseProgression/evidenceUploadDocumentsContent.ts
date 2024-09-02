import {Claim} from 'models/claim';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';

export const getTypeOfDocumentsContents = (claimId: string, claim: Claim) => {
  return getBasicDocumentsContents(claimId, claim, 'PAGES.UPLOAD_EVIDENCE_DOCUMENTS.TITLE');
};

export const getUploadDocumentsContents = (claimId: string, claim: Claim) => {
  return getBasicDocumentsContents(claimId, claim, 'PAGES.UPLOAD_DOCUMENTS.TITLE');
};

const getBasicDocumentsContents = (claimId: string, claim: Claim, title: string) => {
  return new PageSectionBuilder()
    .addMicroText('PAGES.DASHBOARD.HEARINGS.HEARING')
    .addMainTitle(title)
    .addLeadParagraph('COMMON.CASE_NUMBER_PARAM', {claimId:caseNumberPrettify( claimId)}, 'govuk-!-margin-bottom-1')
    .addLeadParagraph('COMMON.CLAIM_AMOUNT_WITH_VALUE', {claimAmount: currencyFormatWithNoTrailingZeros(claim.totalClaimAmount)})
    .build();
};
