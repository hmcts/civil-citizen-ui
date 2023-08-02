import {SummarySection, summarySection} from 'models/summaryList/summarySections';
import {Claim} from 'models/claim';
import {summaryRow} from 'models/summaryList/summaryList';
import {t} from 'i18next';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getLng} from 'common/utils/languageToggleUtils';
import {
  HAS_ANYTHING_CHANGED_URL,
  IS_CASE_READY_URL,
} from 'routes/urls';

const changeLabel = (lang: string | unknown): string => t('COMMON.BUTTONS.CHANGE', { lng: getLng(lang) });

export const buildIsCaseReadyForTrialOrHearing = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  let yourResponseToClaimSection: SummarySection = null;

  yourResponseToClaimSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_TITLE', {lng: getLng(lang)}),
    summaryRows: [],
  });

  yourResponseToClaimSection.summaryList.rows.push(summaryRow(t('PAGES.FINALISE_TRIAL_ARRANGEMENTS.IS_THE_CASE_READY_FOR_TRIAL', { lng: getLng(lang) }), t(`${claim.caseProgression.defendantTrialArrangements.isCaseReady}`, { lng: getLng(lang) }), constructResponseUrlWithIdParams(claimId, IS_CASE_READY_URL), changeLabel(lang)));
  yourResponseToClaimSection.summaryList.rows.push(summaryRow(t('PAGES.FINALISE_TRIAL_ARRANGEMENTS.ARE_THERE_ANY_CHANGES', { lng: getLng(lang) }), '<p class="govuk-summary-list__row" >'+t(`${claim.caseProgression.defendantTrialArrangements.hasAnythingChanged.option}`, { lng: getLng(lang) }) +'<p>' + t(`${claim.caseProgression.defendantTrialArrangements.hasAnythingChanged.textArea}`, { lng: getLng(lang) }), constructResponseUrlWithIdParams(claimId, HAS_ANYTHING_CHANGED_URL), changeLabel(lang)));
  yourResponseToClaimSection.summaryList.rows.push(summaryRow(t('PAGES.FINALISE_TRIAL_ARRANGEMENTS.OTHER_INFORMATION_TITLE', { lng: getLng(lang) }), t(`${claim.caseProgression.defendantTrialArrangements.otherTrialInformation}`, { lng: getLng(lang) }) , constructResponseUrlWithIdParams(claimId, HAS_ANYTHING_CHANGED_URL), changeLabel(lang)));
  return yourResponseToClaimSection;
};

