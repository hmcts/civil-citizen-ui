import {Claim} from 'models/claim';
import {
  getEvidenceUploadLatestUpdateContent,
} from 'services/features/dashboard/claimSummary/latestUpdate/caseProgression/caseProgressionLatestUpdateService';
import {
  buildEvidenceUploadSection,
} from 'services/features/dashboard/claimSummary/latestUpdate/caseProgression/latestUpdateContentBuilderCaseProgression';

describe('Case Progression Latest Update Content service', () => {
  const mockClaim = require('../../../../../../../utils/mocks/civilClaimResponseMock.json');
  const claim = new Claim();
  const mockClaimId = '5129';
  const caseData = Object.assign(claim, mockClaim.case_data);

  const evidenceUploadContent = getEvidenceUploadLatestUpdateContent(mockClaimId, caseData);
  it('should return evidence upload section for latest update content', () => {
    //when
    const evidenceUploadSection = buildEvidenceUploadSection(claim);
    const expectedContent = [evidenceUploadSection].map((sectionContent, index) => ({
      contentSections: sectionContent,
      hasDivider: index < evidenceUploadSection.length - 1,
    }));

    //Then
    expect(evidenceUploadContent).toMatchObject(expectedContent);
    expect(evidenceUploadContent[0].contentSections).toEqual(expectedContent[0].contentSections);
    expect(evidenceUploadContent[0].contentSections.length).toEqual(expectedContent[0].contentSections.length);
  });
});
