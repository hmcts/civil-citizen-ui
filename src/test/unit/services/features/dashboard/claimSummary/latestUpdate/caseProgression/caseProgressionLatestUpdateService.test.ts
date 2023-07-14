import {
  getCaseProgressionLatestUpdates, getFinaliseTrialArrangementsContent,
  getHearingTrialUploadLatestUpdateContent,
} from 'services/features/dashboard/claimSummary/latestUpdate/caseProgression/caseProgressionLatestUpdateService';
import {
  buildEvidenceUploadSection, buildFinaliseTrialArrangements, buildHearingTrialLatestUploadSection,
} from 'services/features/dashboard/claimSummary/latestUpdate/caseProgression/latestUpdateContentBuilderCaseProgression';
import {getCaseProgressionHearingMock} from '../../../../../../../utils/caseProgression/mockCaseProgressionHearing';
import {CaseState} from 'form/models/claimDetails';

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

  it('getCaseProgressionLatestUpdates: should return hearing notice, evidence upload and finalise trial arrangements contents', () => {
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
    expect(result.length).toEqual(3);
    expect(result[0].contentSections[0].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.TRIAL_HEARING_CONTENT.YOUR_HEARING_TITLE');
    expect(result[1].contentSections[0].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.TITLE');
    expect(result[1].contentSections.length).toEqual(6);
    expect(result[2].contentSections[0].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.FINALISE_TRIAL_ARRANGEMENTS.TITLE');
    expect(result[2].contentSections.length).toEqual(5);
  });
});
