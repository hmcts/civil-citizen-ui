import {Claim} from 'models/claim';
import {UploadYourDocumentsSectionBuilder} from 'models/caseProgression/uploadYourDocumentsSectionBuilder';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {ClaimantOrDefendant} from 'models/partyType';
import {UploadDocuments, UploadDocumentTypes} from 'models/caseProgression/uploadDocumentsType';
import {saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {boolean} from 'boolean';

export const getCancelYourUpload = (claimId: string, claim: Claim) => {
  return new UploadYourDocumentsSectionBuilder()
    .addMainTitle('PAGES.EVIDENCE_UPLOAD_CANCEL.TITLE')
    .addLeadParagraph('PAGES.EVIDENCE_UPLOAD_CANCEL.CASE_REFERENCE', {claimId:caseNumberPrettify( claimId)})
    .addLeadParagraph('PAGES.EVIDENCE_UPLOAD_CANCEL.PARTIES', {
      claimantName: claim.getClaimantFullName(),
      defendantName: claim.getDefendantFullName(),
    })
    .addInsetText('PAGES.EVIDENCE_UPLOAD_CANCEL.WARNING_CANCEL')
    .addTitle('PAGES.EVIDENCE_UPLOAD_CANCEL.ARE_YOU_SURE')
    .build();
};

export async function cancelDocumentUpload(claimId: string, claim: Claim, claimantOrDefendant: ClaimantOrDefendant) {
  const uploadDocuments: UploadDocuments = claimantOrDefendant === ClaimantOrDefendant.DEFENDANT
    ? claim.caseProgression.defendantUploadDocuments : claim.caseProgression.claimantUploadDocuments;
  for (const uploadDocumentValue of Object.values(uploadDocuments)) {
    if (uploadDocumentValue instanceof Array && uploadDocumentValue.length > 0 && !(uploadDocumentValue[0] instanceof boolean)) {
      for (const uploadDocumentValueElement of uploadDocumentValue) {
        if (!(uploadDocumentValueElement instanceof boolean)) {
          if ((<UploadDocumentTypes>uploadDocumentValueElement).selected) {
            const index = (<UploadDocumentTypes[]>uploadDocumentValue).indexOf(<UploadDocumentTypes>uploadDocumentValueElement);
            if (index > -1) {
              uploadDocumentValue.splice(index, 1);
            }
          }
        }
      }
    }
  }
  if (uploadDocuments.checkboxGrp.length > 0 && uploadDocuments.checkboxGrp.every(v => v !== null && v !== undefined)) {
    for (let index = 0; index < uploadDocuments.checkboxGrp.length; index++) {
      uploadDocuments.checkboxGrp[index] = false;
    }
  }

  await saveDraftClaim(claimId, claim);
}
