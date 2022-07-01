import {Claim} from '../../../../../common/models/claim';
import {ClaimSummarySection} from '../../../../../common/form/models/claimSummarySection';
import {CaseState} from '../../../../../common/form/models/claimDetails';
import {
  getResponseNotSubmittedTitle,
  getNotPastResponseDeadlineContent,
  getPastResponseDeadlineContent,
  getRespondToClaimLink,
} from './latestUpdateContent/responseToClaimSection';
import {
  getFirstConditionalContentContent,
  getSecondConditionalContentContent,
  getThirdConditionalContentContent,
} from './latestUpdateContent/exampleSectionOne';
import {
  getFourthConditionalContentContent,
  getFifthConditionalContentContent,
} from './latestUpdateContent/exampleSectionTwo';

export const buildResponseToClaimSection = (claim: Claim, lang: string, claimId: string): ClaimSummarySection[] => {
  const sectionContent = [];
  const responseNotSubmittedTitle = getResponseNotSubmittedTitle(lang);
  const responseDeadlineNotPassedContent = getNotPastResponseDeadlineContent(claim, lang);
  const responseDeadlinePassedContent = getPastResponseDeadlineContent(claim, lang);
  const respondToClaimLink = getRespondToClaimLink(claimId, lang);
  if (claim.ccdState === CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT) {
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

export const buildExampleSectionOne = (claim: Claim, lang: string, claimId: string): ClaimSummarySection[] => {
  const sectionContent: any[] = [];
  const firstConditionalContent = getFirstConditionalContentContent(claim, lang, claimId);
  const secondConditionalContent = getSecondConditionalContentContent(claim, lang);
  const thirdConditionalContent = getThirdConditionalContentContent(claim, lang);
  const number = 10;

  if (false) {
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

export const buildExampleSectionTwo = (claim: Claim, lang: string, claimId: string): ClaimSummarySection[] => {
  const sectionContent:any[] = [];
  const fourthConditionalContent = getFourthConditionalContentContent(claim, lang);
  const fifthConditionalContent = getFifthConditionalContentContent(claim, lang);
  const number = 10;

  if (false) {
    if (number > 8) {
      sectionContent.push(fourthConditionalContent);
    }
    if (number > 5) {
      sectionContent.push(fifthConditionalContent);

    }
  }
  return sectionContent.flat();
};


