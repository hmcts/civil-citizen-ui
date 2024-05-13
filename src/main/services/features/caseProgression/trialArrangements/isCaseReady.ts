import {Claim} from 'models/claim';
import {UploadYourDocumentsSectionBuilder} from 'models/caseProgression/uploadYourDocumentsSectionBuilder';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';

export const getIsCaseReady = (claimId: string, claim: Claim) => {
  return new UploadYourDocumentsSectionBuilder()
    .addMicroText('PAGES.FINALISE_TRIAL_ARRANGEMENTS.PAGE_TITLE')
    .addMainTitle('PAGES.IS_CASE_READY.PAGE_TITLE')
    .addLeadParagraph('COMMON.CASE_NUMBER', {claimId:caseNumberPrettify(claimId)}, 'govuk-!-margin-bottom-1')
    .addLeadParagraph('COMMON.CLAIM_AMOUNT_WITH_VALUE', {claimAmount: currencyFormatWithNoTrailingZeros(claim.totalClaimAmount)})
    .addTitle('PAGES.IS_CASE_READY.IS_CASE_READY',null,'govuk-!-margin-bottom-0')
    .addParagraph('PAGES.IS_CASE_READY.YOU_ARE_REMINDED')
    .build();
};
