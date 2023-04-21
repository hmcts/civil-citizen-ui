import {ClaimSummarySection, ClaimSummaryType} from '../../../../../../common/form/models/claimSummarySection';
import {Claim} from '../../../../../../common/models/claim';
import {BILINGUAL_LANGUAGE_PREFERENCE_URL} from '../../../../../../routes/urls';

export const getWitnessTitle = (): ClaimSummarySection => {
  return ({
    type: ClaimSummaryType.TITLE,
    data: {
      text: 'PAGES.LATEST_UPDATE_CONTENT.MORE_TIME_REQUESTED',
    },
  });
};

export const getWitnessYourStatement = (): ClaimSummarySection => {
  return {
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: 'PAGES.LATEST_UPDATE_CONTENT.YOU_NEED_TO_RESPOND_BEFORE_DEADLINE',
      variables:
        {},
    },
  };
};
