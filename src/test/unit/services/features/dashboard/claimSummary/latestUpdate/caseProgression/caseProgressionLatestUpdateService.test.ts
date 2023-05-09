import {
  getCaseProgressionLatestUpdates,
  getEvidenceUploadLatestUpdateContent, getHearingTrialUploadLatestUpdateContent,
} from 'services/features/dashboard/claimSummary/latestUpdate/caseProgression/caseProgressionLatestUpdateService';
import {
  buildEvidenceUploadSection, buildHearingTrialLatestUploadSection,
} from 'services/features/dashboard/claimSummary/latestUpdate/caseProgression/latestUpdateContentBuilderCaseProgression';
import {getCaseProgressionHearingMock} from '../../../../../../../utils/caseProgression/mockCaseProgressionHearing';
import {CaseState} from 'form/models/claimDetails';

describe('Case Progression Latest Update Content service', () => {
  const claim = require('../../../../../../../utils/mocks/civilClaimResponseMock.json');
  const claimId = claim.id;
  const claimWithSdo = {
    ...claim,
    state: CaseState.AWAITING_APPLICANT_INTENTION,
    case_data: {
      ...claim.case_data,
      sdoOrderDocument: {
        value: {
          createdBy: 'test',
          documentLink: 'test',
          documentName: 'test',
          documentSize: 'test',
          documentType: 'test',
          createdDatetime: 'test',
        },
        classification: 'test',
      },
    },
  };

  it('getEvidenceUploadLatestUpdateContent: should return evidence upload section for latest update content', () => {
    //Given
    const evidenceUploadContentExpected = getEvidenceUploadLatestUpdateContent(claimId, claimWithSdo);

    //When
    const evidenceUploadSectionResult = buildEvidenceUploadSection(claimWithSdo);

    //Then
    expect(evidenceUploadContentExpected).toMatchObject(evidenceUploadSectionResult);
    expect(evidenceUploadSectionResult[0][0].data.text).toEqual('PAGES.LATEST_UPDATE_CONTENT.EVIDENCE_UPLOAD.TITLE');
    expect(evidenceUploadSectionResult[0].length).toEqual(4);
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
  });

  it('getCaseProgressionLatestUpdates: evidence upload should have additional content with hearing', () => {
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
    expect(result[1].contentSections.length).toEqual(6);
  });
});
