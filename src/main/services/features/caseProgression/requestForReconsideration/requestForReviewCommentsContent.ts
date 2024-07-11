import {Claim} from 'models/claim';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {CaseRole} from 'form/models/caseRoles';
import {
  FinaliseYourTrialSectionBuilder,
} from 'models/caseProgression/trialArrangements/finaliseYourTrialSectionBuilder';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';
import {t} from 'i18next';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {REQUEST_FOR_RECONSIDERATION_CANCEL_URL} from 'routes/urls';

export const getRequestForReviewCommentsContent = (claim: Claim, claimId: string) => {
  const claimantOrDefendant = getClaimantOrDefendant(claim);

  return new PageSectionBuilder()
    .addMicroText('PAGES.REQUEST_FOR_RECONSIDERATION.REQUEST_FOR_REVIEW_COMMENTS.MICRO_TEXT')
    .addMainTitle('PAGES.REQUEST_FOR_RECONSIDERATION.REQUEST_FOR_REVIEW_COMMENTS.MAIN_TITLE')
    .addLeadParagraph('COMMON.CASE_NUMBER_PARAM', {claimId:caseNumberPrettify(claimId)}, 'govuk-!-margin-bottom-1')
    .addLeadParagraph('COMMON.CLAIM_AMOUNT_WITH_VALUE', {claimAmount: currencyFormatWithNoTrailingZeros(claim.totalClaimAmount)})
    .addParagraph('PAGES.REQUEST_FOR_RECONSIDERATION.REQUEST_FOR_REVIEW_COMMENTS.REVIEW_HAS_BEEN_REQUESTED', null, 'govuk-!-margin-bottom-1')
    .addParagraph('PAGES.REQUEST_FOR_RECONSIDERATION.REQUEST_FOR_REVIEW_COMMENTS.ADD_OWN_COMMENTS',null, 'govuk-!-margin-bottom-1')
    .addParagraph('PAGES.REQUEST_FOR_RECONSIDERATION.REQUEST_FOR_REVIEW_COMMENTS.WILL_SEE_COMMENTS', {claimantOrDefendant: claimantOrDefendant},  'govuk-!-margin-bottom-1')
    .addParagraph('PAGES.REQUEST_FOR_RECONSIDERATION.REQUEST_FOR_REVIEW_COMMENTS.ANY_EVIDENCE_INCLUDED', null, 'govuk-!-margin-bottom-1')
    .build();
};

export const getButtonContent = (claimId: string) => {
  return new PageSectionBuilder()
    .addButtonWithCancelLink('COMMON.BUTTONS.CONTINUE', '', false, REQUEST_FOR_RECONSIDERATION_CANCEL_URL
      .replace(':id', claimId)
      .replace(':propertyName', 'caseProgression') )
    .build();
};

export const getClaimantOrDefendant = (claim: Claim) => {
  if (claim?.caseRole === CaseRole.CLAIMANT) {
    return claim.getDefendantFullName();
  } else {
    return claim.getClaimantFullName();
  }
};

export const getRequestForReconsiderationCommentsConfirmationContent = (claim: Claim, lang: string, redirectUrl: string): ClaimSummarySection[] => {
  return getConfirmationPageSection(claim, lang, redirectUrl);
};

export function getConfirmationPageSection(claim: Claim, lang: string, redirectUrl: string): ClaimSummarySection[] {
  return new FinaliseYourTrialSectionBuilder()
    .addMainTitle('PAGES.REQUEST_FOR_RECONSIDERATION.COMMENTS_CONFIRMATION.WHAT_HAPPENS_NEXT')
    .addParagraph('PAGES.REQUEST_FOR_RECONSIDERATION.COMMENTS_CONFIRMATION.LET_OTHER_PARTY_KNOW', {
      claimantOrDefendant:getClaimantOrDefendant(claim),
    })
    .addParagraph('PAGES.REQUEST_FOR_RECONSIDERATION.COMMENTS_CONFIRMATION.JUDGE_WILL_REVIEW')
    .addParagraph('PAGES.REQUEST_FOR_RECONSIDERATION.COMMENTS_CONFIRMATION.CONTINUE_TO_FOLLOW_ORDER')
    .addButton(t('COMMON.BUTTONS.CLOSE_AND_RETURN_TO_CASE_OVERVIEW', {lng:lang}), constructResponseUrlWithIdParams(claim.id, redirectUrl))
    .build();
}
