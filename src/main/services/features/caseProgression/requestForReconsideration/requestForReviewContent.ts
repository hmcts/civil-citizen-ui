import {Claim} from 'models/claim';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {CaseRole} from 'form/models/caseRoles';
import {
  FinaliseYourTrialSectionBuilder,
} from 'models/caseProgression/trialArrangements/finaliseYourTrialSectionBuilder';
import {ClaimSummarySection} from 'form/models/claimSummarySection';

export const getRequestForReviewContent = (claim: Claim) => {
  const claimantOrDefendant = getClaimantOrDefendant(claim);

  return new PageSectionBuilder()
    .addMicroText('PAGES.REQUEST_FOR_RECONSIDERATION.REQUEST_FOR_REVIEW.MICRO_TEXT')
    .addMainTitle('PAGES.REQUEST_FOR_RECONSIDERATION.REQUEST_FOR_REVIEW.MAIN_TITLE')
    .addLeadParagraph('PAGES.REQUEST_FOR_RECONSIDERATION.REQUEST_FOR_REVIEW.PARAGRAPH', {claimantOrDefendant: claimantOrDefendant})
    .build();
};

export const getButtonContent = () => {

  return new PageSectionBuilder()
    .addButton('COMMON.BUTTONS.SAVE_AND_CONTINUE','')
    .build();
};

export const getClaimantOrDefendant = (claim: Claim) => {
  let party;
  if (claim?.caseRole === CaseRole.CLAIMANT) {
    party = claim.respondent1;
  } else {
    party = claim.applicant1;
  }
  return party.partyDetails.title + ' ' + party.partyDetails.firstName + ' ' + party.partyDetails.lastName;
};

export const getNameRequestForReconsideration = (claim: Claim): string => {
  return claim.caseRole == CaseRole.CLAIMANT ? 'requestForReviewClaimant' : 'requestForReviewDefendant';
};

export const getRequestForReconsiderationConfirmationContent = (claim: Claim): ClaimSummarySection[] => {
  return getConfirmationPageSection(claim);
};

export function getConfirmationPageSection(claim: Claim): ClaimSummarySection[] {
  const title = 'PAGES.REQUEST_FOR_RECONSIDERATION.CONFIRMATION.WHAT_HAPPENS_NEXT';
  const date = claim.caseProgression?.requestForReconsiderationDeadline;
  return new FinaliseYourTrialSectionBuilder()
    .addMainTitle(title)
    .addParagraph('PAGES.REQUEST_FOR_RECONSIDERATION.CONFIRMATION.PARAGRAPH_1', {claimantOrDefendant:getClaimantOrDefendant(claim), date: date})
    .addParagraph('PAGES.REQUEST_FOR_RECONSIDERATION.CONFIRMATION.PARAGRAPH_2')
    .addParagraph('PAGES.REQUEST_FOR_RECONSIDERATION.CONFIRMATION.PARAGRAPH_3')
    .build();
}
