import {Claim} from '../../../../../common/models/claim';
import {ClaimSummarySection} from '../../../../../common/form/models/claimSummarySection';
import {CaseState} from '../../../../../common/form/models/claimDetails';
import {
  getNotPastResponseDeadlineContent,
  getPastResponseDeadlineContent,
  getRespondToClaimLink,
  getResponseNotSubmittedTitle,
} from './latestUpdateContent/responseToClaimSection';
import {
  getFirstConditionalContentContent,
  getSecondConditionalContentContent,
  getThirdConditionalContentContent,
} from './latestUpdateContent/exampleSectionOne';
import {
  getFifthConditionalContentContent,
  getFourthConditionalContentContent,
} from './latestUpdateContent/exampleSectionTwo';

export const buildResponseToClaimSection = (claim: Claim, claimId: string): ClaimSummarySection[] => {
  const sectionContent = [];
  const responseNotSubmittedTitle = getResponseNotSubmittedTitle(claim.isDeadlineExtended());
  const responseDeadlineNotPassedContent = getNotPastResponseDeadlineContent(claim);
  const responseDeadlinePassedContent = getPastResponseDeadlineContent(claim);
  const respondToClaimLink = getRespondToClaimLink(claimId);
  if (claim.isDefendantNotResponded()) {
    sectionContent.push(responseNotSubmittedTitle);
    if (claim.isDeadLinePassed()) {
      sectionContent.push(responseDeadlinePassedContent);
    } else {
      sectionContent.push(responseDeadlineNotPassedContent);
    }
    sectionContent.push(respondToClaimLink);
  }

  return sectionContent.flat();
};

// TODO: concept example builder, needs to be replaced with new section builder to be developed
/* istanbul ignore next */
export const buildExampleSectionOne = (claim: Claim, claimId: string): ClaimSummarySection[] => {
  const sectionContent = [];
  const firstConditionalContent = getFirstConditionalContentContent(claim, claimId);
  const secondConditionalContent = getSecondConditionalContentContent(claim);
  const thirdConditionalContent = getThirdConditionalContentContent(claim);
  const number = 10;

  if (claim.ccdState === CaseState.PENDING_CASE_ISSUED) {
    if (number > 8) {
      sectionContent.push(firstConditionalContent);
    }
    if (number < 8) {
      sectionContent.push(secondConditionalContent);

    }
    sectionContent.push(thirdConditionalContent);
  }
  return sectionContent.flat();
};
// TODO: concept example builder, needs to be replaced with new section builder to be developed
/* istanbul ignore next */
export const buildExampleSectionTwo = (claim: Claim, claimId: string): ClaimSummarySection[] => {// NOSONAR
  const sectionContent = [];
  const fourthConditionalContent = getFourthConditionalContentContent(claim);
  const fifthConditionalContent = getFifthConditionalContentContent(claim);
  const number = 10;

  if (claim.ccdState === CaseState.PENDING_CASE_ISSUED) {
    if (number > 8) {
      sectionContent.push(fourthConditionalContent);
    }
    if (number > 5) {
      sectionContent.push(fifthConditionalContent);

    }
  }
  return sectionContent.flat();
};
