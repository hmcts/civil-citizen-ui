import {SummarySection, summarySection} from 'models/summaryList/summarySections';
import {Claim} from 'models/claim';
import {summaryRow} from 'models/summaryList/summaryList';
import {t} from 'i18next';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getLng} from 'common/utils/languageToggleUtils';
import {
  REQUEST_FOR_RECONSIDERATION_URL,
} from 'routes/urls';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {CaseRole} from 'form/models/caseRoles';
import {currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';

const changeLabel = (lang: string ): string => t('COMMON.BUTTONS.CHANGE', { lng: getLng(lang) });

export const buildRequestForReconsideration = (claim: Claim, claimId: string, lang: string ): SummarySection => {
  const requestForReview = claim.caseRole == CaseRole.CLAIMANT
    ? claim.caseProgression.requestForReviewClaimant
    : claim.caseProgression.requestForReviewDefendant;

  const requestForReviewSummarySections = summarySection({
    title: null,
    summaryRows: [],
  });

  requestForReviewSummarySections.summaryList.rows.push(summaryRow(t('PAGES.REQUEST_FOR_RECONSIDERATION.REQUEST_FOR_REVIEW.MAIN_TITLE', { lng: getLng(lang) }),
    '<p>' + t(`${requestForReview.textArea}`, { lng: getLng(lang) })
    + '</p>', constructResponseUrlWithIdParams(claimId, REQUEST_FOR_RECONSIDERATION_URL), changeLabel(lang)));

  return requestForReviewSummarySections;
};

export const buildCaseInfoContents = (claim: Claim, claimId: string): ClaimSummarySection[] => {
  return new PageSectionBuilder()
    .addMicroText('PAGES.REQUEST_FOR_RECONSIDERATION.REQUEST_FOR_REVIEW.MICRO_TEXT')
    .addMainTitle('PAGES.CHECK_YOUR_ANSWER.TITLE')
    .addLeadParagraph('COMMON.CASE_NUMBER_PARAM', {claimId:caseNumberPrettify(claimId)}, 'govuk-!-margin-bottom-1')
    .addLeadParagraph('COMMON.CLAIM_AMOUNT_WITH_VALUE', {claimAmount: currencyFormatWithNoTrailingZeros(claim.totalClaimAmount)})
    ._claimSummarySections;
};
