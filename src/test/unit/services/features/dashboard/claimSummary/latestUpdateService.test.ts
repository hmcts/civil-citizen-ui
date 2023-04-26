import {Claim} from '../../../../../../main/common/models/claim';
import {
  getEvidenceUploadLatestUpdateContent,
  getLatestUpdateContent,
} from '../../../../../../main/services/features/dashboard/claimSummary/latestUpdateService';
import {
  buildEvidenceUploadSection,
  buildResponseToClaimSection,
} from '../../../../../../main/services/features/dashboard/claimSummary/latestUpdate/latestUpdateContentBuilder';

describe('Latest Update Content service', () => {
  const mockClaim = require('../../../../../utils/mocks/civilClaimResponseMock.json');
  const claim = new Claim();
  const mockClaimId = '5129';
  const caseData = Object.assign(claim, mockClaim.case_data);
  const actualLatestUpdateContent = getLatestUpdateContent(mockClaimId, caseData);
  it('should return response to claim section latest update content', () => {
    //when
    const responseToClaimSection = buildResponseToClaimSection(caseData, mockClaimId);
    const latestUpdateContent = [responseToClaimSection];
    const filteredLatestUpdateContent = latestUpdateContent.filter(sectionContent => sectionContent.length);
    const formattedLatestUpdateContent = filteredLatestUpdateContent.map((sectionContent, index) => {
      return ({
        contentSections: sectionContent,
        hasDivider: index < filteredLatestUpdateContent.length - 1,
      });
    });
    //Then
    expect(actualLatestUpdateContent).toMatchObject(formattedLatestUpdateContent);
    expect(actualLatestUpdateContent[0].contentSections).toEqual(filteredLatestUpdateContent[0]);
    expect(actualLatestUpdateContent[0].contentSections.length).toEqual(filteredLatestUpdateContent[0].length);
  });

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
