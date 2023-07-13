import {LatestUpdateSectionBuilder} from 'models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';
import {Claim} from 'models/claim';
import {t} from 'i18next';

const FINALISE_TRIAL_ARRANGEMENTS = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.FINALISE_TRIAL_ARRANGEMENTS';

export const getFinaliseTrialArrangements = (claim: Claim) => {
  const deadline = claim.finalisingTrialArrangementsDeadline;
  const htmlText = t(`${FINALISE_TRIAL_ARRANGEMENTS}.IF_THERE_ARE_CHANGES`, {finalisingTrialArrangementsDeadline: deadline});
  const latestUpdateSectionBuilder = new LatestUpdateSectionBuilder()
    .addTitle(`${FINALISE_TRIAL_ARRANGEMENTS}.TITLE`)
    .addWarning(`${FINALISE_TRIAL_ARRANGEMENTS}.DUE_BY`, {finalisingTrialArrangementsDeadline: deadline})
    .addRawHtml(htmlText)
    .addButton(`${FINALISE_TRIAL_ARRANGEMENTS}.FINALISE_TRIAL_ARRANGEMENTS_BUTTON`, 'href');

  return latestUpdateSectionBuilder.build();
};
