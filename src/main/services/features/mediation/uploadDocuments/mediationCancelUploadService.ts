import {Claim} from 'models/claim';
import {UploadYourDocumentsSectionBuilder} from 'models/caseProgression/uploadYourDocumentsSectionBuilder';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {deleteFieldDraftClaimFromStore} from 'modules/draft-store/draftStoreService';
import {currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';

export const getCancelYourUpload = (claimId: string, claim: Claim) => {
  return new UploadYourDocumentsSectionBuilder()
    .addMicroText('COMMON.MEDIATION')
    .addMainTitle('PAGES.EVIDENCE_UPLOAD_CANCEL.TITLE')
    .addLeadParagraph('COMMON.CASE_NUMBER_PARAM', {claimId:caseNumberPrettify(claimId)}, 'govuk-!-margin-bottom-1')
    .addLeadParagraph('COMMON.CLAIM_AMOUNT_WITH_VALUE', {claimAmount: currencyFormatWithNoTrailingZeros(claim.totalClaimAmount)})
    .addInsetText('PAGES.EVIDENCE_UPLOAD_CANCEL.WARNING_CANCEL')
    .addTitle('PAGES.EVIDENCE_UPLOAD_CANCEL.ARE_YOU_SURE')
    .build();
};

export async function cancelMediationDocumentUpload(redisKey: string, claim: Claim) {
  await deleteFieldDraftClaimFromStore(redisKey, claim, 'mediationUploadDocuments');
}
