import {SummarySection, summarySection} from 'models/summaryList/summarySections';
import {Claim} from 'models/claim';
import {summaryRow} from 'models/summaryList/summaryList';
import {t} from 'i18next';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getLng} from 'common/utils/languageToggleUtils';
import {
  REQUEST_FOR_RECONSIDERATION_COMMENTS_URL,
  REQUEST_FOR_RECONSIDERATION_URL,
} from 'routes/urls';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {CaseRole} from 'form/models/caseRoles';
import {currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';

const changeLabel = (lang: string ): string => t('COMMON.BUTTONS.CHANGE', { lng: getLng(lang) });

export const buildRequestForReconsiderationBase = (claim: Claim, claimId: string, lang: string, fieldLink: string, fieldTitle: string): SummarySection => {
  const requestForReview = claim.caseRole == CaseRole.CLAIMANT
    ? claim.caseProgression.requestForReviewClaimant
    : claim.caseProgression.requestForReviewDefendant;

  const requestForReviewSummarySections = summarySection({
    title: null,
    summaryRows: [],
  });

  requestForReviewSummarySections.summaryList.rows.push(summaryRow(t(fieldTitle, { lng: getLng(lang) }),
    '<p>' + t(`${requestForReview.textArea}`, { lng: getLng(lang) })
    + '</p>', constructResponseUrlWithIdParams(claimId, fieldLink), changeLabel(lang)));

  return requestForReviewSummarySections;
};

export const buildRequestForReconsideration = (claim: Claim, claimId: string, lang: string ): SummarySection => {
  return buildRequestForReconsiderationBase(claim, claimId, lang, REQUEST_FOR_RECONSIDERATION_URL, 'PAGES.REQUEST_FOR_RECONSIDERATION.REQUEST_FOR_REVIEW.MAIN_TITLE');
};

export const buildRequestForReconsiderationComments = (claim: Claim, claimId: string, lang: string ): SummarySection => {
  return buildRequestForReconsiderationBase(claim, claimId, lang, REQUEST_FOR_RECONSIDERATION_COMMENTS_URL, 'PAGES.REQUEST_FOR_RECONSIDERATION.REQUEST_FOR_REVIEW_COMMENTS.MAIN_TITLE');
};

export const buildCaseInfoContents = (claim: Claim, claimId: string, microText: string): ClaimSummarySection[] => {
  return new PageSectionBuilder()
    .addMicroText(microText)
    .addMainTitle('PAGES.CHECK_YOUR_ANSWER.TITLE')
    .addLeadParagraph('COMMON.CASE_NUMBER_PARAM', {claimId:caseNumberPrettify(claimId)}, 'govuk-!-margin-bottom-1')
    .addLeadParagraph('COMMON.CLAIM_AMOUNT_WITH_VALUE', {claimAmount: currencyFormatWithNoTrailingZeros(claim.totalClaimAmount)})
    ._claimSummarySections;
};
