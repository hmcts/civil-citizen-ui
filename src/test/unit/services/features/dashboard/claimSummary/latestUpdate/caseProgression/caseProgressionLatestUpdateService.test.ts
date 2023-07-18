import {
  getCaseProgressionLatestUpdates,
  getHearingTrialUploadLatestUpdateContent, getViewTrialArrangementsContent,
} from 'services/features/dashboard/claimSummary/latestUpdate/caseProgression/caseProgressionLatestUpdateService';
import {
  buildEvidenceUploadSection,
  buildHearingTrialLatestUploadSection,
} from 'services/features/dashboard/claimSummary/latestUpdate/caseProgression/latestUpdateContentBuilderCaseProgression';
import {
  getCaseProgressionHearingMock,
  getCaseProgressionHearingWithTrialReadinessMock,
} from '../../../../../../../utils/caseProgression/mockCaseProgressionHearing';
import {CaseState} from 'form/models/claimDetails';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {ClaimSummaryContent, ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';

describe('Case Progression Latest Update Content service', () => {
  const claim = require('../../../../../../../utils/mocks/civilClaimResponseMock.json');
  const claimWithSdo = {
    ...claim,
    state: CaseState.AWAITING_APPLICANT_INTENTION,
    case_data: {
      ...claim.case_data,
    },
  };

  it('getEvidenceUploadLatestUpdateContent: evidence upload should have additional content with hearing', () => {
    //Given:
    claimWithSdo.caseProgressionHearing = getCaseProgressionHearingMock();
    const claimWithSdoAndHearing = {
      ...claimWithSdo,
      hasCaseProgressionHearingDocuments: () => true,
      hasSdoOrderDocument: () => true,
    };

    //When
    const evidenceUploadSectionResult = buildEvidenceUploadSection(claimWithSdoAndHearing);

    //Then
    expect(evidenceUploadSectionResult[0].length).toEqual(6);
    expect(evidenceUploadSectionResult[0][4].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.DOCUMENTS_SUBMITTED_NOT_CONSIDERED');
  });

  it('getHearingTrialUploadLatestUpdateContent: should return CaseProgression hearing upload section for latest update content', () => {
    //Given
    claim.caseProgressionHearing = getCaseProgressionHearingMock();
    const hearingUploadSectionExpected = buildHearingTrialLatestUploadSection(claim, 'en');

    //when
    const hearingUploadSectionResult = getHearingTrialUploadLatestUpdateContent(claim, 'en');

    //Then
    expect(hearingUploadSectionExpected).toMatchObject(hearingUploadSectionResult);
    expect(hearingUploadSectionResult[0][0].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.TRIAL_HEARING_CONTENT.YOUR_HEARING_TITLE');
  });

  describe('View Trial Arrangements', () => {
    const VIEW_TRIAL_ARRANGEMENTS = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.VIEW_TRIAL_ARRANGEMENTS';
    const claimWithSdoAndHearing = {
      ...claimWithSdo,
      hasCaseProgressionHearingDocuments: () => true,
      hasSdoOrderDocument: () => true,
    };
    const lang = 'en';
    let result: ClaimSummaryContent[];

    it('getCaseProgressionLatestUpdates should return hearing notice, view trial arrangements for the current party (respondent) as only they have finalised their trial arrangements and evidence upload contents', () => {
      //Given
      claimWithSdoAndHearing.caseProgressionHearing = getCaseProgressionHearingWithTrialReadinessMock(YesNoUpperCamelCase.NO, YesNoUpperCamelCase.YES);
      //When
      result = getCaseProgressionLatestUpdates(claimWithSdoAndHearing, lang);
      //Then
      expect(result.length).toEqual(3);
      expect(result[0].contentSections[0].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.TRIAL_HEARING_CONTENT.YOUR_HEARING_TITLE');
      expect(result[1].contentSections[0].data.text).toEqual(`${VIEW_TRIAL_ARRANGEMENTS}.TITLE_YOU`);
      expect(result[1].contentSections[1].data.text).toEqual(`${VIEW_TRIAL_ARRANGEMENTS}.YOU_CAN_VIEW_YOUR_TRIAL_ARRANGEMENTS`);
      expect(result[1].contentSections[2].data.text).toEqual(`${VIEW_TRIAL_ARRANGEMENTS}.VIEW_TRIAL_ARRANGEMENTS_BUTTON`);
      expect(result[1].contentSections.length).toEqual(3);
      expect(result[2].contentSections[0].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.TITLE');
      expect(result[2].contentSections.length).toEqual(6);
    });

    it('getCaseProgressionLatestUpdates should return hearing notice, view trial arrangements section for the other party (claimant) as only they have finalised their trial arrangements and evidence upload contents', () => {
      //Given
      claimWithSdoAndHearing.caseProgressionHearing = getCaseProgressionHearingWithTrialReadinessMock(YesNoUpperCamelCase.YES, YesNoUpperCamelCase.NO);
      //When
      result = getCaseProgressionLatestUpdates(claimWithSdoAndHearing, lang);
      //Then
      expect(result.length).toEqual(3);
      expect(result[0].contentSections[0].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.TRIAL_HEARING_CONTENT.YOUR_HEARING_TITLE');
      expect(result[1].contentSections[0].data.text).toEqual(`${VIEW_TRIAL_ARRANGEMENTS}.TITLE_OTHER_PARTY`);
      expect(result[1].contentSections[1].data.text).toEqual(`${VIEW_TRIAL_ARRANGEMENTS}.YOU_CAN_VIEW_OTHER_PARTY`);
      expect(result[1].contentSections.length).toEqual(3);
      expect(result[2].contentSections[0].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.TITLE');
      expect(result[2].contentSections.length).toEqual(6);
    });

    it('getCaseProgressionLatestUpdates should return hearing notice, view trial arrangements section for the both parties as they have finalised their trial arrangements and evidence upload contents', () => {
      //Given
      claimWithSdoAndHearing.caseProgressionHearing = getCaseProgressionHearingWithTrialReadinessMock(YesNoUpperCamelCase.YES, YesNoUpperCamelCase.YES);
      //When
      result = getCaseProgressionLatestUpdates(claimWithSdoAndHearing, lang);
      //Then
      expect(result.length).toEqual(4);
      expect(result[0].contentSections[0].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.TRIAL_HEARING_CONTENT.YOUR_HEARING_TITLE');
      expect(result[1].contentSections[0].data.text).toEqual(`${VIEW_TRIAL_ARRANGEMENTS}.TITLE_OTHER_PARTY`);
      expect(result[1].contentSections.length).toEqual(3);
      expect(result[2].contentSections[0].data.text).toEqual(`${VIEW_TRIAL_ARRANGEMENTS}.TITLE_YOU`);
      expect(result[2].contentSections.length).toEqual(3);
      expect(result[3].contentSections[0].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.TITLE');
      expect(result[3].contentSections.length).toEqual(6);
    });

    it('getViewTrialArrangementsContent should return trial arrangements content for the current party (respondent) if isOtherParty false', () => {
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
      const viewTrialArrangementsContent = getViewTrialArrangementsContent(isOtherParty);
      //Then
      expect([viewTrialArrangementsContentExpected]).toEqual(viewTrialArrangementsContent);
    });

    it('getViewTrialArrangementsContent should return trial arrangements content for the other party (claimant) if isOtherParty true', () => {
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
      const viewTrialArrangementsContent = getViewTrialArrangementsContent(isOtherParty);
      //Then
      expect([viewTrialArrangementsContentExpected]).toEqual(viewTrialArrangementsContent);
    });
  });

  it('getCaseProgressionLatestUpdates: should return hearing notice and evidence upload contents', () => {
    //Given:
    claimWithSdo.caseProgressionHearing = getCaseProgressionHearingMock();
    const claimWithSdoAndHearing = {
      ...claimWithSdo,
      hasCaseProgressionHearingDocuments: () => true,
      hasSdoOrderDocument: () => true,
    };

    //When
    const result = getCaseProgressionLatestUpdates(claimWithSdoAndHearing, 'en');

    //Then
    expect(result.length).toEqual(2);
    expect(result[0].contentSections[0].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.TRIAL_HEARING_CONTENT.YOUR_HEARING_TITLE');
    expect(result[1].contentSections[0].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.TITLE');
    expect(result[1].contentSections.length).toEqual(6);
  });
});
