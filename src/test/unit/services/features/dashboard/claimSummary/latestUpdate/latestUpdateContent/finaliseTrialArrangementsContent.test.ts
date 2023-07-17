import {LatestUpdateSectionBuilder} from 'models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';
import {t} from 'i18next';
import {DEFENDANT_DOCUMENTS_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {
  getFinaliseTrialArrangements,
} from 'services/features/dashboard/claimSummary/latestUpdate/latestUpdateContent/finaliseTrialArrangementsContent';
import {CaseProgressionHearing} from 'models/caseProgression/caseProgressionHearing';

describe('test getFinaliseTrialArrangements', () => {
  it('', () => {
    //Given
    const claim = new Claim();
    claim.caseProgressionHearing = new CaseProgressionHearing([], null, new Date(2023, 6, 29), null);
    const FINALISE_TRIAL_ARRANGEMENTS = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.FINALISE_TRIAL_ARRANGEMENTS';
    const boldText = t(`${FINALISE_TRIAL_ARRANGEMENTS}.IF_THERE_ARE_CHANGES_END`, {finalisingTrialArrangementsDeadline: claim.finalisingTrialArrangementsDeadline});
    const finaliseTrialArrangementsContentExpected = new LatestUpdateSectionBuilder()
      .addTitle(`${FINALISE_TRIAL_ARRANGEMENTS}.TITLE`)
      .addWarning(`${FINALISE_TRIAL_ARRANGEMENTS}.DUE_BY`, {finalisingTrialArrangementsDeadline: claim.finalisingTrialArrangementsDeadline})
      .addRawHtml(`<p class="govuk-body">${t(`${FINALISE_TRIAL_ARRANGEMENTS}.IF_THERE_ARE_CHANGES_BEGINNING`)}
                                <span class="govuk-body govuk-!-font-weight-bold">${boldText}</span>.
                              </p>`)
      .addLink(`${FINALISE_TRIAL_ARRANGEMENTS}.DIRECTIONS_QUESTIONNAIRE`,
        DEFENDANT_DOCUMENTS_URL.replace(':id', claim.id),
        `${FINALISE_TRIAL_ARRANGEMENTS}.YOU_MAY_WISH_TO_REVIEW`,
        `${FINALISE_TRIAL_ARRANGEMENTS}.UNDER_NOTICES_AND_ORDERS`)
      .addButton(`${FINALISE_TRIAL_ARRANGEMENTS}.FINALISE_TRIAL_ARRANGEMENTS_BUTTON`, 'href') //TODO: provide an actual href once CIV-9124 is merged into master
      .build();
    //When
    const finaliseTrialArrangementsContentActual = getFinaliseTrialArrangements(claim);
    //Then
    expect(finaliseTrialArrangementsContentExpected).toEqual(finaliseTrialArrangementsContentActual);
  });
});
