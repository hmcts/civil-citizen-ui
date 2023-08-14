import {
  checkEvidenceUploaded,
  getCaseProgressionLatestUpdates,
  getHearingTrialUploadLatestUpdateContent,
  getViewTrialArrangementsContent,
} from 'services/features/dashboard/claimSummary/latestUpdate/caseProgression/caseProgressionLatestUpdateService';
import {
  buildEvidenceUploadSection,
  buildHearingTrialLatestUploadSection,
} from 'services/features/dashboard/claimSummary/latestUpdate/caseProgression/latestUpdateContentBuilderCaseProgression';
import {getCaseProgressionHearingMock} from '../../../../../../../utils/caseProgression/mockCaseProgressionHearing';
import {CaseState} from 'form/models/claimDetails';
import {Claim} from 'models/claim';
import {checkEvidenceUploadTime} from 'common/utils/dateUtils';
import {ClaimSummaryContent, ClaimSummarySection, ClaimSummaryType} from 'form/models/claimSummarySection';
import {YesNo} from 'form/models/yesNo';
import {TrialArrangements} from 'models/caseProgression/trialArrangements/trialArrangements';

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
      claimWithSdoAndHearing.caseProgressionHearing = getCaseProgressionHearingMock();
      const claimantTrialArrangements = new TrialArrangements();
      claimantTrialArrangements.isCaseReady = YesNo.NO;
      const defendantTrialArrangements = new TrialArrangements();
      defendantTrialArrangements.isCaseReady = YesNo.YES;
      claimWithSdoAndHearing.caseProgression = {
        claimantTrialArrangements: claimantTrialArrangements,
        defendantTrialArrangements: defendantTrialArrangements,
      };
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
      claimWithSdoAndHearing.caseProgressionHearing = getCaseProgressionHearingMock();
      const claimantTrialArrangements = new TrialArrangements();
      claimantTrialArrangements.isCaseReady = YesNo.YES;
      const defendantTrialArrangements = new TrialArrangements();
      defendantTrialArrangements.isCaseReady = YesNo.NO;
      claimWithSdoAndHearing.caseProgression = {
        claimantTrialArrangements: claimantTrialArrangements,
        defendantTrialArrangements: defendantTrialArrangements,
      };
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
      claimWithSdoAndHearing.caseProgressionHearing = getCaseProgressionHearingMock();
      const claimantTrialArrangements = new TrialArrangements();
      claimantTrialArrangements.isCaseReady = YesNo.YES;
      const defendantTrialArrangements = new TrialArrangements();
      defendantTrialArrangements.isCaseReady = YesNo.YES;
      claimWithSdoAndHearing.caseProgression = {
        claimantTrialArrangements: claimantTrialArrangements,
        defendantTrialArrangements: defendantTrialArrangements,
      };
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

  it('getCaseProgressionLatestUpdates: should return hearing notice and evidence upload contents, but not new upload contents', () => {
    //Given:
    jest
      .useFakeTimers()
      .setSystemTime(new Date('2020-01-02T17:59'));

    claimWithSdo.caseProgressionHearing = getCaseProgressionHearingMock();
    const claimantTrialArrangements = new TrialArrangements();
    claimantTrialArrangements.isCaseReady = YesNo.NO;
    const defendantTrialArrangements = new TrialArrangements();
    defendantTrialArrangements.isCaseReady = YesNo.NO;

    const claimWithSdoAndHearing = {
      ...claimWithSdo,
      hasCaseProgressionHearingDocuments: () => true,
      hasSdoOrderDocument: () => true,
      caseProgression: {
        claimantLastUploadDate: new Date('2020-01-01T18:00'),
        claimantTrialArrangements: claimantTrialArrangements,
        defendantTrialArrangements: defendantTrialArrangements,
      },
    };

    //When
    const result = getCaseProgressionLatestUpdates(claimWithSdoAndHearing, 'en');

    //Then
    expect(result.length).toEqual(2);
    expect(result[0].contentSections[0].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.TRIAL_HEARING_CONTENT.YOUR_HEARING_TITLE');
    expect(result[1].contentSections[0].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.TITLE');
    expect(result[1].contentSections.length).toEqual(6);
  });

  it('getCaseProgressionLatestUpdates: should return hearing notice, evidence upload, and new upload contents', () => {
    //Given:
    jest
      .useFakeTimers()
      .setSystemTime(new Date('2020-01-02T17:59'));
    claimWithSdo.caseProgressionHearing = getCaseProgressionHearingMock();
    const claimantTrialArrangements = new TrialArrangements();
    claimantTrialArrangements.isCaseReady = YesNo.NO;
    const defendantTrialArrangements = new TrialArrangements();
    defendantTrialArrangements.isCaseReady = YesNo.NO;

    const claimWithSdoAndHearing = {
      ...claimWithSdo,
      hasCaseProgressionHearingDocuments: () => true,
      hasSdoOrderDocument: () => true,
      caseProgression: {
        claimantLastUploadDate: new Date('2020-01-01T17:59'),
        claimantTrialArrangements: claimantTrialArrangements,
        defendantTrialArrangements: defendantTrialArrangements,
      },
    };

    //When
    const result = getCaseProgressionLatestUpdates(claimWithSdoAndHearing, 'en');

    //Then
    expect(result.length).toEqual(3);
    expect(result[0].contentSections[0].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.NEW_UPLOAD.TITLE');
    expect(result[1].contentSections[0].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.TRIAL_HEARING_CONTENT.YOUR_HEARING_TITLE');
    expect(result[2].contentSections[0].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.TITLE');
    expect(result[2].contentSections.length).toEqual(6);
  });

  it('getCaseProgressionLatestUpdates: should return hearing notice, evidence upload, and new upload contents', () => {
    //Given:
    jest
      .useFakeTimers()
      .setSystemTime(new Date('2020-01-02T17:59'));
    const claimantTrialArrangements = new TrialArrangements();
    claimantTrialArrangements.isCaseReady = YesNo.NO;
    const defendantTrialArrangements = new TrialArrangements();
    defendantTrialArrangements.isCaseReady = YesNo.NO;

    const claim = {
      caseProgression: {
        claimantLastUploadDate: new Date('2020-01-01T17:59'),
        defendantLastUploadDate: new Date('2020-01-01T18:00'),
        claimantTrialArrangements: claimantTrialArrangements,
        defendantTrialArrangements: defendantTrialArrangements,
      },
    } as Claim;

    //When
    const resultClaimant = checkEvidenceUploaded(claim, true);
    const resultClaimantDirectly = checkEvidenceUploadTime(claim.caseProgression.defendantLastUploadDate);
    const resultDefendant = checkEvidenceUploaded(claim, false);
    const resultDefendantDirectly = checkEvidenceUploadTime(claim.caseProgression.claimantLastUploadDate);

    //Then
    expect(resultClaimant).toBeFalsy();
    expect(resultClaimantDirectly).toBeFalsy();
    expect(resultDefendant).toBeTruthy();
    expect(resultDefendantDirectly).toBeTruthy();

  });

  it('getCaseProgressionLatestUpdates: should return hearing notice, evidence upload, and new upload contents', () => {
    //Given:
    jest
      .useFakeTimers()
      .setSystemTime(new Date('2020-01-02T17:59'));
    const claimantTrialArrangements = new TrialArrangements();
    claimantTrialArrangements.isCaseReady = YesNo.NO;
    const defendantTrialArrangements = new TrialArrangements();
    defendantTrialArrangements.isCaseReady = YesNo.NO;

    const claim = {
      caseProgression: {
        claimantLastUploadDate: new Date('2020-01-01T18:00'),
        defendantLastUploadDate: new Date('2020-01-01T17:59'),
        claimantTrialArrangements: claimantTrialArrangements,
        defendantTrialArrangements: defendantTrialArrangements,
      },
    } as Claim;

    //When
    const resultClaimant = checkEvidenceUploaded(claim, true);
    const resultClaimantDirectly = checkEvidenceUploadTime(claim.caseProgression.defendantLastUploadDate);
    const resultDefendant = checkEvidenceUploaded(claim, false);
    const resultDefendantDirectly = checkEvidenceUploadTime(claim.caseProgression.claimantLastUploadDate);

    //Then
    expect(resultClaimant).toBeTruthy();
    expect(resultClaimantDirectly).toBeTruthy();
    expect(resultDefendant).toBeFalsy();
    expect(resultDefendantDirectly).toBeFalsy();
  });
});
