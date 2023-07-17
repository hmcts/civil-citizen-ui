import {LatestUpdateSectionBuilder} from 'models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';

const VIEW_TRIAL_ARRANGEMENTS = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.VIEW_TRIAL_ARRANGEMENTS';

export const getViewTrialArrangements = (isOtherParty: boolean) => {
  const viewTrialArrangementsTitle = isOtherParty
    ? `${VIEW_TRIAL_ARRANGEMENTS}.TITLE_OTHER_PARTY`
    : `${VIEW_TRIAL_ARRANGEMENTS}.TITLE_YOU`;

  const viewTrialArrangementsParagraph = isOtherParty
    ? `${VIEW_TRIAL_ARRANGEMENTS}.YOU_CAN_VIEW_OTHER_PARTY`
    : `${VIEW_TRIAL_ARRANGEMENTS}.YOU_CAN_VIEW_YOUR_TRIAL_ARRANGEMENTS`;

  const latestUpdateSectionBuilder = new LatestUpdateSectionBuilder()
    .addTitle(viewTrialArrangementsTitle)
    .addParagraph(viewTrialArrangementsParagraph)
    .addButton(`${VIEW_TRIAL_ARRANGEMENTS}.VIEW_TRIAL_ARRANGEMENTS_BUTTON`, 'href'); //TODO: provide an actual href once CIV-9124 is merged into master
  return latestUpdateSectionBuilder.build();
};
