import {SummarySection, summarySection} from 'models/summaryList/summarySections';
import {Claim} from 'models/claim';
import {summaryRow} from 'models/summaryList/summaryList';
import {t} from 'i18next';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getLng} from 'common/utils/languageToggleUtils';
import {
  HAS_ANYTHING_CHANGED_URL,
  IS_CASE_READY_URL, TRIAL_ARRANGEMENTS_HEARING_DURATION,
} from 'routes/urls';

const changeLabel = (lang: string | unknown): string => t('COMMON.BUTTONS.CHANGE', { lng: getLng(lang) });

export const buildIsCaseReadyForTrialOrHearing = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  let trialReadySummarySections: SummarySection = null;

  trialReadySummarySections = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_TITLE', {lng: getLng(lang)}),
    summaryRows: [],
  });

  trialReadySummarySections.summaryList.rows.push(summaryRow(t('PAGES.IS_CASE_READY.IS_CASE_READY', { lng: getLng(lang) }), t(`${claim.caseProgression.defendantTrialArrangements.isCaseReady}`, { lng: getLng(lang) }), constructResponseUrlWithIdParams(claimId, IS_CASE_READY_URL), changeLabel(lang)));
  trialReadySummarySections.summaryList.rows.push(summaryRow(t('PAGES.FINALISE_TRIAL_ARRANGEMENTS.ARE_THERE_ANY_CHANGES', { lng: getLng(lang) }), '<p class="govuk-section-break--visible" >'+t(`${claim.caseProgression.defendantTrialArrangements.hasAnythingChanged.option}`, { lng: getLng(lang) }) +'</p><p>' + t(`${claim.caseProgression.defendantTrialArrangements.hasAnythingChanged.textArea}`, { lng: getLng(lang) })+'</p>', constructResponseUrlWithIdParams(claimId, HAS_ANYTHING_CHANGED_URL), changeLabel(lang)));
  trialReadySummarySections.summaryList.rows.push(summaryRow(t('PAGES.FINALISE_TRIAL_ARRANGEMENTS.OTHER_INFORMATION_TITLE', { lng: getLng(lang) }), t(`${claim.caseProgression.defendantTrialArrangements.otherTrialInformation}`, { lng: getLng(lang) }) , constructResponseUrlWithIdParams(claimId, TRIAL_ARRANGEMENTS_HEARING_DURATION), changeLabel(lang)));
  return trialReadySummarySections;
};

