import {
  checkEvidenceUploaded,
  getCaseProgressionLatestUpdates,
  getFinaliseTrialArrangementsContent,
  getHearingTrialUploadLatestUpdateContent,
} from 'services/features/dashboard/claimSummary/latestUpdate/caseProgression/caseProgressionLatestUpdateService';
import {
  buildEvidenceUploadSection, buildFinaliseTrialArrangements, buildHearingTrialLatestUploadSection,
} from 'services/features/dashboard/claimSummary/latestUpdate/caseProgression/latestUpdateContentBuilderCaseProgression';
import {getCaseProgressionHearingMock} from '../../../../../../../utils/caseProgression/mockCaseProgressionHearing';
import {CaseState} from 'form/models/claimDetails';
import {Claim} from 'models/claim';
import {checkEvidenceUploadTime} from 'common/utils/dateUtils';
import {CaseProgressionHearing} from 'models/caseProgression/caseProgressionHearing';

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
    const claimWithSdoAndHearing = {
      ...claimWithSdo,
      hasCaseProgressionHearingDocuments: () => true,
      hasSdoOrderDocument: () => true,
      isSixWeeksOrLessFromTrial: () => false,
      caseProgressionHearing: getCaseProgressionHearingMock(),
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

  it('getFinaliseTrialArrangementsContent: should return finalise trial arrangements content', () => {
    //Given
    claim.caseProgressionHearing = getCaseProgressionHearingMock();
    const finaliseTrialArrangementsSectionExpected = buildFinaliseTrialArrangements(claim);

    //When
    const finaliseTrialArrangementsSectionResult = getFinaliseTrialArrangementsContent(claim);

    //Then
    expect(finaliseTrialArrangementsSectionExpected).toMatchObject(finaliseTrialArrangementsSectionResult);
    expect(finaliseTrialArrangementsSectionResult[0][0].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.FINALISE_TRIAL_ARRANGEMENTS.TITLE');
  });

  it('getCaseProgressionLatestUpdates: if no hearingscheduled, but SDO then return evidence upload contents, but not hearing notice or new upload contents', () => {
    //Given:
    const claimWithSdoNoHearing = {
      ...claimWithSdo,
      hasCaseProgressionHearingDocuments: () => false,
      hasSdoOrderDocument: () => true,
      isBundleStitched: () => false,
      isFinalGeneralOrderIssued: () => false,
    } as Claim;

    //When
    const result = getCaseProgressionLatestUpdates(claimWithSdoNoHearing, 'en');

    //Then
    expect(result.length).toEqual(1);
    expect(result[0].contentSections[0].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.TITLE');
    expect(result[0].contentSections.length).toEqual(5);
  });

  it('getCaseProgressionLatestUpdates: should return hearing notice and evidence upload contents, but not new upload contents', () => {
    //Given:
    jest
      .useFakeTimers()
      .setSystemTime(new Date('2020-01-02T17:59'));

    claimWithSdo.caseProgressionHearing = getCaseProgressionHearingMock();

    const claimWithSdoAndHearing = {
      ...claimWithSdo,
      hasCaseProgressionHearingDocuments: () => true,
      hasSdoOrderDocument: () => true,
      isFastTrackClaim: false,
      isSixWeeksOrLessFromTrial: () => false,
      isBundleStitched: () => true,
      isFinalGeneralOrderIssued: () => false,
      caseProgression: {
        claimantLastUploadDate: new Date('2020-01-01T18:00'),
      },
    };

    //When
    const result = getCaseProgressionLatestUpdates(claimWithSdoAndHearing, 'en');

    //Then
    expect(result.length).toEqual(3);
    expect(result[0].contentSections[0].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.BUNDLE.TITLE');
    expect(result[1].contentSections[0].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.TRIAL_HEARING_CONTENT.YOUR_HEARING_TITLE');
    expect(result[2].contentSections[0].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.TITLE');
    expect(result[2].contentSections.length).toEqual(6);
  });

  it('getCaseProgressionLatestUpdates: should return hearing notice, evidence upload, and new upload contents', () => {
    //Given:
    jest
      .useFakeTimers()
      .setSystemTime(new Date('2020-01-02T17:59'));
    claimWithSdo.caseProgressionHearing = getCaseProgressionHearingMock();

    const claimWithSdoAndHearing = {
      ...claimWithSdo,
      hasCaseProgressionHearingDocuments: () => true,
      hasSdoOrderDocument: () => true,
      isBundleStitched: () => false,
      isFastTrackClaim: false,
      isSixWeeksOrLessFromTrial: () => false,
      isFinalGeneralOrderIssued: () => false,
      caseProgression: {
        claimantLastUploadDate: new Date('2020-01-01T17:59'),
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

  it('getCaseProgressionLatestUpdates: should return hearing notice, evidence upload, and new upload contents, ' +
    'but not finalise trial arrangements if it is a small track claim', () => {
    //Given:
    jest
      .useFakeTimers()
      .setSystemTime(new Date('2020-01-02T17:59'));
    claimWithSdo.caseProgressionHearing = getCaseProgressionHearingMock();

    const claimWithSdoAndHearing = {
      ...claimWithSdo,
      hasCaseProgressionHearingDocuments: () => true,
      hasSdoOrderDocument: () => true,
      isFastTrackClaim: false,
      isSixWeeksOrLessFromTrial: () => true,
      isBundleStitched: () => true,
      isFinalGeneralOrderIssued: () => false,
      caseProgression: {
        claimantLastUploadDate: new Date('2020-01-01T17:59'),
      },
    };

    //When
    const result = getCaseProgressionLatestUpdates(claimWithSdoAndHearing, 'en');

    //Then
    expect(result.length).toEqual(4);
    expect(result[0].contentSections[0].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.BUNDLE.TITLE');
    expect(result[1].contentSections[0].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.NEW_UPLOAD.TITLE');
    expect(result[2].contentSections[0].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.TRIAL_HEARING_CONTENT.YOUR_HEARING_TITLE');
    expect(result[3].contentSections[0].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.TITLE');
    expect(result[3].contentSections.length).toEqual(6);
  });

  it('getCaseProgressionLatestUpdates: should return hearing notice, evidence upload, and new upload contents, ' +
    'but not finalise trial arrangements given it is not six weeks or less from trial', () => {
    //Given:
    jest
      .useFakeTimers()
      .setSystemTime(new Date('2020-01-02T17:59'));
    claimWithSdo.caseProgressionHearing = getCaseProgressionHearingMock();

    const claimWithSdoAndHearing = {
      ...claimWithSdo,
      hasCaseProgressionHearingDocuments: () => true,
      hasSdoOrderDocument: () => true,
      isFastTrackClaim: true,
      isSixWeeksOrLessFromTrial: () => false,
      isBundleStitched: () => false,
      isFinalGeneralOrderIssued: () => false,
      caseProgression: {
        claimantLastUploadDate: new Date('2020-01-01T17:59'),
      },
    };

    //When
    const result = getCaseProgressionLatestUpdates(claimWithSdoAndHearing, 'en');

    //Then
    expect(result.length).toEqual(3);
    expect(result[0].contentSections[0].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.NEW_UPLOAD.TITLE');
    expect(result[1].contentSections[0].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.TRIAL_HEARING_CONTENT.YOUR_TRIAL_TITLE');
    expect(result[2].contentSections[0].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.TITLE');
    expect(result[2].contentSections.length).toEqual(6);
  });

  it('getCaseProgressionLatestUpdates: should return hearing notice, finalise trial arrangements, evidence upload, and new upload contents', () => {
    //Given:
    const today = new Date();
    const trialDate = new Date();
    trialDate.setDate(today.getDate() + 6 * 7);
    const fakeNowDate = new Date(today.setHours(17,59,0,0));
    const fakeDayBeforeDate = new Date();
    fakeDayBeforeDate.setDate(fakeNowDate.getDate() - 1);
    fakeDayBeforeDate.setHours(17,59,0,0);

    jest
      .useFakeTimers()
      .setSystemTime(fakeNowDate);
    const caseProgressionHearingMock = getCaseProgressionHearingMock();
    const caseProgressionHearing = new CaseProgressionHearing(
      caseProgressionHearingMock.hearingDocuments,
      caseProgressionHearingMock.hearingLocation,
      trialDate,
      caseProgressionHearingMock.hearingTimeHourMinute);

    const claimWithSdoAndHearing: Claim = {
      ...claimWithSdo,
      hasCaseProgressionHearingDocuments: () => true,
      hasSdoOrderDocument: () => true,
      isFastTrackClaim: true,
      isSixWeeksOrLessFromTrial: () => true,
      isBundleStitched: () => false,
      caseProgression: {
        claimantLastUploadDate: fakeDayBeforeDate,
      },
      isFinalGeneralOrderIssued: () => true,
      caseProgressionHearing,
    };

    //When
    const result = getCaseProgressionLatestUpdates(claimWithSdoAndHearing, 'en');

    //Then
    expect(result.length).toEqual(5);
    expect(result[0].contentSections[0].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.VIEW_ORDER.TITLE');
    expect(result[1].contentSections[0].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.NEW_UPLOAD.TITLE');
    expect(result[2].contentSections[0].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.TRIAL_HEARING_CONTENT.YOUR_TRIAL_TITLE');
    expect(result[3].contentSections[0].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.FINALISE_TRIAL_ARRANGEMENTS.TITLE');
    expect(result[3].contentSections.length).toEqual(5);
    expect(result[4].contentSections[0].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.TITLE');
    expect(result[4].contentSections.length).toEqual(6);
  });

  it('getCaseProgressionLatestUpdates: should return hearing notice, evidence upload, and new upload contents', () => {
    //Given:
    jest
      .useFakeTimers()
      .setSystemTime(new Date('2020-01-02T17:59'));

    const claim = {
      caseProgression: {
        claimantLastUploadDate: new Date('2020-01-01T17:59'),
        defendantLastUploadDate: new Date('2020-01-01T18:00'),
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

    const claim = {
      caseProgression: {
        claimantLastUploadDate: new Date('2020-01-01T18:00'),
        defendantLastUploadDate: new Date('2020-01-01T17:59'),
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

  it('getCaseProgressionLatestUpdates: should return case Dismissed notification due to hearing fee not paid for defendant', () => {
    //Given:
    jest
      .useFakeTimers()
      .setSystemTime(new Date('2020-01-02T17:59'));

    claimWithSdo.caseProgressionHearing = getCaseProgressionHearingMock();

    const claimDismissedHearingFeeNotPaid = {
      ...claimWithSdo,
      isBundleStitched: () => false,
      isFinalGeneralOrderIssued: () => false,
      caseDismissedHearingFeeDueDate: new Date('2020-01-01T18:00'),
    };

    //When
    const result = getCaseProgressionLatestUpdates(claimDismissedHearingFeeNotPaid, 'en');

    //Then
    expect(result[0].contentSections[0].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.CASE_DISMISSED_HEARING_DUE_DATE.TITLE');
    expect(result[0].contentSections[1].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.CASE_DISMISSED_HEARING_DUE_DATE.DEFENDANT_WARNING');
    expect(result[0].contentSections[2].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.CASE_DISMISSED_HEARING_DUE_DATE.DEFENDANT_PARAGRAPH');
  });

  it('getCaseProgressionLatestUpdates: should not return case Dismissed notification if caseDismissedHearingFeeDueDate not yet reached', () => {
    //Given:
    jest
      .useFakeTimers()
      .setSystemTime(new Date('2020-01-02T17:59'));

    claimWithSdo.caseProgressionHearing = getCaseProgressionHearingMock();

    const claimDismissedHearingFeeNotPaid = {
      hasCaseProgressionHearingDocuments: () => true,
      hasSdoOrderDocument: () => true,
      isBundleStitched: () => false,
      isFinalGeneralOrderIssued: () => false,
      ...claimWithSdo,
    };

    //When
    const result = getCaseProgressionLatestUpdates(claimDismissedHearingFeeNotPaid, 'en');

    //Then
    expect(result[0].contentSections[0].data.text).not.toEqual('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.CASE_DISMISSED_HEARING_DUE_DATE.TITLE');
    expect(result[0].contentSections[1].data.text).not.toEqual('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.CASE_DISMISSED_HEARING_DUE_DATE.DEFENDANT_WARNING');
    expect(result[0].contentSections[2].data.text).not.toEqual('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.CASE_DISMISSED_HEARING_DUE_DATE.DEFENDANT_PARAGRAPH');
  });
});
