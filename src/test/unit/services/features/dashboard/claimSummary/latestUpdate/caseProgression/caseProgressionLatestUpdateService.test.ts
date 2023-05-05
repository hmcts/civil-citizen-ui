import {Claim} from 'models/claim';
import {
  getClaimSummaryContent,
  getEvidenceUploadLatestUpdateContent, getHearingTrialUploadLatestUpdateContent,
} from 'services/features/dashboard/claimSummary/latestUpdate/caseProgression/caseProgressionLatestUpdateService';
import {
  buildEvidenceUploadSection, buildHearingTrialLatestUploadSection,
} from 'services/features/dashboard/claimSummary/latestUpdate/caseProgression/latestUpdateContentBuilderCaseProgression';
import {getCaseProgressionHearingMock} from '../../../../../../../utils/caseProgression/mockCaseProgressionHearing';

describe('Case Progression Latest Update Content service', () => {
  const mockClaim = require('../../../../../../../utils/mocks/civilClaimResponseMock.json');
  const claim = new Claim();
  const mockClaimId = '5129';
  const caseData = Object.assign(claim, mockClaim.case_data);

  const evidenceUploadContent = getEvidenceUploadLatestUpdateContent(mockClaimId, caseData);
  it('should return evidence upload section for latest update content', () => {
    //when
    const evidenceUploadSection = buildEvidenceUploadSection(claim);
    const expectedContent = evidenceUploadSection.map((sectionContent, index) => ({
      contentSections: sectionContent,
      hasDivider: index < evidenceUploadSection.length - 1,
    }));

    //Then
    expect(evidenceUploadContent).toMatchObject(expectedContent);
    expect(evidenceUploadContent[0].contentSections).toEqual(expectedContent[0].contentSections);
    expect(evidenceUploadContent[0].contentSections.length).toEqual(expectedContent[0].contentSections.length);
  });

  it('should return CaseProgression hearing upload section for latest update content', () => {
    //Given
    claim.caseProgressionHearing = getCaseProgressionHearingMock();
    const hearingUploadSectionExpected = buildHearingTrialLatestUploadSection(claim, 'en');
    const hearingUploadSectionExpect = getClaimSummaryContent(hearingUploadSectionExpected);

    //when
    const hearingUploadSectionResult = getHearingTrialUploadLatestUpdateContent(claim, 'en');

    //Then
    expect(hearingUploadSectionExpect).toMatchObject(hearingUploadSectionResult);

  });
});
