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
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {CaseRole} from 'form/models/caseRoles';

const changeLabel = (lang: string | unknown): string => t('COMMON.BUTTONS.CHANGE', { lng: getLng(lang) });

export const buildIsCaseReadyForTrialOrHearing = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  let trialReadySummarySections: SummarySection = null;
  const trialArrangements = claim.caseRole == CaseRole.CLAIMANT ? claim.caseProgression.claimantTrialArrangements : claim.caseProgression.defendantTrialArrangements;

  trialReadySummarySections = summarySection({
    title: null,
    summaryRows: [],
  });

  trialReadySummarySections.summaryList.rows.push(summaryRow(t('PAGES.IS_CASE_READY.IS_CASE_READY', { lng: getLng(lang) }),
    t(`COMMON.${trialArrangements.isCaseReady.toUpperCase()}`, { lng: getLng(lang) }),
    constructResponseUrlWithIdParams(claimId, IS_CASE_READY_URL), changeLabel(lang)));

  trialReadySummarySections.summaryList.rows.push(summaryRow(t('PAGES.FINALISE_TRIAL_ARRANGEMENTS.ARE_THERE_ANY_CHANGES', { lng: getLng(lang) }),
    '<p>'+t(`COMMON.${trialArrangements.hasAnythingChanged.option.toUpperCase()}`, { lng: getLng(lang) })
    +'</p><hr class="govuk-section-break--visible--l" ><p>'
    + t(`${trialArrangements.hasAnythingChanged.textArea}`, { lng: getLng(lang) })
    +'</p>', constructResponseUrlWithIdParams(claimId, HAS_ANYTHING_CHANGED_URL), changeLabel(lang)));

  if (trialArrangements.otherTrialInformation.length > 0) {
    trialReadySummarySections.summaryList.rows.push(summaryRow(t('PAGES.FINALISE_TRIAL_ARRANGEMENTS.OTHER_INFORMATION_TITLE',
      {lng: getLng(lang)}), t(`${trialArrangements.otherTrialInformation}`, {lng: getLng(lang)}),
    constructResponseUrlWithIdParams(claimId, TRIAL_ARRANGEMENTS_HEARING_DURATION), changeLabel(lang)));
  }

  return trialReadySummarySections;
};

export const buildCaseInfoContents = (claim: Claim, claimId: string): ClaimSummarySection[] => {
  return new PageSectionBuilder()
    .addLeadParagraph('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CASE_REFERENCE',
      {claimId:caseNumberPrettify(claimId)}, 'govuk-!-margin-bottom-1')
    .addLeadParagraph('PAGES.FINALISE_TRIAL_ARRANGEMENTS.PARTIES', {
      claimantName: claim.getClaimantFullName(),
      defendantName: claim.getDefendantFullName(),
    })
    ._claimSummarySections;
};
