import {Claim} from 'models/claim';
import {UploadYourDocumentsSectionBuilder} from 'models/caseProgression/uploadYourDocumentsSectionBuilder';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {deleteDraftClaimFromStore} from 'modules/draft-store/draftStoreService';

export const getCancelYourUpload = (claimId: string, claim: Claim) => {
  return new UploadYourDocumentsSectionBuilder()
    .addMainTitle('PAGES.EVIDENCE_UPLOAD_CANCEL.TITLE')
    .addLeadParagraph('PAGES.EVIDENCE_UPLOAD_CANCEL.CASE_REFERENCE', {claimId:caseNumberPrettify( claimId)})
    .addLeadParagraph('COMMON.PARTIES', {
      claimantName: claim.getClaimantFullName(),
      defendantName: claim.getDefendantFullName(),
    })
    .addInsetText('PAGES.EVIDENCE_UPLOAD_CANCEL.WARNING_CANCEL')
    .addTitle('PAGES.EVIDENCE_UPLOAD_CANCEL.ARE_YOU_SURE')
    .build();
};

export async function cancelDocumentUpload(claimId: string) {
  await deleteDraftClaimFromStore(claimId);
}

export const getHearingDuration = (claim: Claim) => {
  return new UploadYourDocumentsSectionBuilder()
    .addMainTitle('PAGES.EVIDENCE_UPLOAD_CANCEL.TITLE')
    .addLeadParagraph('PAGES.EVIDENCE_UPLOAD_CANCEL.CASE_REFERENCE', {claimId:caseNumberPrettify(claim.id)})
    .addLeadParagraph('PAGES.EVIDENCE_UPLOAD_CANCEL.PARTIES', {
      claimantName: claim.getClaimantFullName(),
      defendantName: claim.getDefendantFullName(),
    })
    .addTitle('Hearing duration')
    .addParagraph('The hearing duration originally allocated is {{hearingDuration}}.', {hearingDuration: claim.caseProgressionHearing.getHearingTimeHourMinuteFormatted()})
    .addParagraph('If you require less time please set out your reasons in the \'Other information\' box below.')
    .addInsetText('The time allocated for the hearing or trial will not be increased until an application is received, the fee paid, and an order made.')
    .build();
};
