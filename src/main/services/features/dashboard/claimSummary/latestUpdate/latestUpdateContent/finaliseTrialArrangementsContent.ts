import {LatestUpdateSectionBuilder} from 'models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';
import {Claim} from 'models/claim';
import {t} from 'i18next';
import {DEFENDANT_DOCUMENTS_URL} from 'routes/urls';

const FINALISE_TRIAL_ARRANGEMENTS = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.FINALISE_TRIAL_ARRANGEMENTS';

export const getFinaliseTrialArrangements = (claim: Claim) => {
  const deadline = claim.finalisingTrialArrangementsDeadline;
  const htmlText = `<p class="govuk-body">${t(`${FINALISE_TRIAL_ARRANGEMENTS}.IF_THERE_ARE_CHANGES_BEGINNING`)}
                                <span class="govuk-body govuk-!-font-weight-bold">${t(`${FINALISE_TRIAL_ARRANGEMENTS}.IF_THERE_ARE_CHANGES_END`, {finalisingTrialArrangementsDeadline: deadline})}</span>.
                              </p>`;
  const linkText = `${FINALISE_TRIAL_ARRANGEMENTS}.DIRECTIONS_QUESTIONNAIRE`;
  const linkHref =  DEFENDANT_DOCUMENTS_URL.replace(':id', claim.id);
  const linkTextBefore = `${FINALISE_TRIAL_ARRANGEMENTS}.YOU_MAY_WISH_TO_REVIEW`;
  const linkTextAfter = `${FINALISE_TRIAL_ARRANGEMENTS}.UNDER_NOTICES_AND_ORDERS`;

  const latestUpdateSectionBuilder = new LatestUpdateSectionBuilder()
    .addTitle(`${FINALISE_TRIAL_ARRANGEMENTS}.TITLE`)
    .addWarning(`${FINALISE_TRIAL_ARRANGEMENTS}.DUE_BY`, {finalisingTrialArrangementsDeadline: deadline})
    .addRawHtml(htmlText)
    .addLink(linkText, linkHref, linkTextBefore, linkTextAfter)
    .addButton(`${FINALISE_TRIAL_ARRANGEMENTS}.FINALISE_TRIAL_ARRANGEMENTS_BUTTON`, 'href'); //TODO: provide an actual href once CIV-9124 is merged into master

  return latestUpdateSectionBuilder.build();
};
