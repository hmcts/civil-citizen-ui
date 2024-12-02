import {Claim} from 'models/claim';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {CaseRole} from 'form/models/caseRoles';
import {
  FinaliseYourTrialSectionBuilder,
} from 'models/caseProgression/trialArrangements/finaliseYourTrialSectionBuilder';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';
import {REQUEST_FOR_RECONSIDERATION_CANCEL_URL} from 'routes/urls';
import {t} from 'i18next';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

export const getRequestForReviewContent = (claim: Claim, claimId: string) => {
  const claimantOrDefendant = getClaimantOrDefendant(claim);

  return new PageSectionBuilder()
    .addMicroText('PAGES.REQUEST_FOR_RECONSIDERATION.REQUEST_FOR_REVIEW.MICRO_TEXT')
    .addMainTitle('PAGES.REQUEST_FOR_RECONSIDERATION.REQUEST_FOR_REVIEW.MAIN_TITLE')
    .addLeadParagraph('COMMON.CASE_NUMBER_PARAM', {claimId:caseNumberPrettify(claimId)}, 'govuk-!-margin-bottom-1')
    .addLeadParagraph('COMMON.CLAIM_AMOUNT_WITH_VALUE', {claimAmount: currencyFormatWithNoTrailingZeros(claim.totalClaimAmount)})
    .addParagraph('PAGES.REQUEST_FOR_RECONSIDERATION.REQUEST_FOR_REVIEW.PARAGRAPH', {claimantOrDefendant: claimantOrDefendant})
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
  return claim.caseRole == CaseRole.CLAIMANT ? claim.getDefendantFullName() : claim.getClaimantFullName();
};

export const getNameRequestForReconsideration = (claim: Claim): string => {
  return claim.caseRole == CaseRole.CLAIMANT ? 'requestForReviewClaimant' : 'requestForReviewDefendant';
};

export const getRequestForReconsiderationConfirmationContent = (claim: Claim, lang: string, redirectUrl: string): ClaimSummarySection[] => {
  return getConfirmationPageSection(claim, lang, redirectUrl);
};

export function getConfirmationPageSection(claim: Claim, lang: string, redirectUrl: string): ClaimSummarySection[] {
  const title = 'PAGES.REQUEST_FOR_RECONSIDERATION.CONFIRMATION.WHAT_HAPPENS_NEXT';
  const date = claim.caseProgression?.requestForReconsiderationDeadline;
  return new FinaliseYourTrialSectionBuilder()
    .addMainTitle(title)
    .addParagraph('PAGES.REQUEST_FOR_RECONSIDERATION.CONFIRMATION.PARAGRAPH_1', {
      claimantOrDefendant:getClaimantOrDefendant(claim),
      date: formatDateToFullDate(date, lang),
    })
    .addParagraph('PAGES.REQUEST_FOR_RECONSIDERATION.CONFIRMATION.PARAGRAPH_2')
    .addParagraph('PAGES.REQUEST_FOR_RECONSIDERATION.CONFIRMATION.PARAGRAPH_3')
    .addButton(t('COMMON.BUTTONS.CLOSE_AND_RETURN_TO_CASE_OVERVIEW', {lng:lang}), constructResponseUrlWithIdParams(claim.id, redirectUrl))
    .build();
}

export function getRequestForReconsiderationDocumentForConfirmation (claim: Claim) {
  if (claim.isClaimant()) {
    return claim?.caseProgression?.requestForReconsiderationDocument?.documentLink.document_binary_url;
  } else {
    return claim?.caseProgression?.requestForReconsiderationDocumentRes?.documentLink.document_binary_url;
  }
}
