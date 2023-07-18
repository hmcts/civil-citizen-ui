import {ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {
  getViewTrialArrangements,
} from 'services/features/dashboard/claimSummary/latestUpdate/latestUpdateContent/viewTrialArrangementsContent';

describe('test getViewTrialArrangements', () => {
  const VIEW_TRIAL_ARRANGEMENTS = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.VIEW_TRIAL_ARRANGEMENTS';
  it('should return trial arrangements content for the current party (respondent) if isOtherParty false', () => {
    //Given
    const isOtherParty = false;
    const viewTrialArrangementsContentExpected: ClaimSummarySection[] = [
      {
        type: ClaimSummaryType.TITLE,
        data: {
          text: `${VIEW_TRIAL_ARRANGEMENTS}.TITLE_YOU`,
        },
      },
      {
        type: ClaimSummaryType.PARAGRAPH,
        data: {
          text: `${VIEW_TRIAL_ARRANGEMENTS}.YOU_CAN_VIEW_YOUR_TRIAL_ARRANGEMENTS`,
        },
      },
      {
        type: ClaimSummaryType.BUTTON,
        data: {
          text: `${VIEW_TRIAL_ARRANGEMENTS}.VIEW_TRIAL_ARRANGEMENTS_BUTTON`,
          href: 'href',
        },
      },
    ];
    //When
    const viewTrialArrangementsContent = getViewTrialArrangements(isOtherParty);
    //Then
    expect(viewTrialArrangementsContentExpected).toEqual(viewTrialArrangementsContent);
  });

  it('should return trial arrangements content for the other party (claimant) if isOtherParty true', () => {
    //Given
    const isOtherParty = true;
    const viewTrialArrangementsContentExpected: ClaimSummarySection[] = [
      {
        type: ClaimSummaryType.TITLE,
        data: {
          text: `${VIEW_TRIAL_ARRANGEMENTS}.TITLE_OTHER_PARTY`,
        },
      },
      {
        type: ClaimSummaryType.PARAGRAPH,
        data: {
          text: `${VIEW_TRIAL_ARRANGEMENTS}.YOU_CAN_VIEW_OTHER_PARTY`,
        },
      },
      {
        type: ClaimSummaryType.BUTTON,
        data: {
          text: `${VIEW_TRIAL_ARRANGEMENTS}.VIEW_TRIAL_ARRANGEMENTS_BUTTON`,
          href: 'href',
        },
      },
    ];
    //When
    const viewTrialArrangementsContent = getViewTrialArrangements(isOtherParty);
    //Then
    expect(viewTrialArrangementsContentExpected).toEqual(viewTrialArrangementsContent);
  });
});
