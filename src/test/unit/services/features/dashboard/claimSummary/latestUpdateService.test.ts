import {Claim} from '../../../../../../main/common/models/claim';
import {getLatestUpdateContent} from '../../../../../../main/services/features/dashboard/claimSummary/latestUpdateService';
import {buildResponseToClaimSection} from '../../../../../../main/services/features/dashboard/claimSummary/latestUpdate/latestUpdateContentBuilder';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Latest Update Content service', () => {
  const mockClaim = require('../../../../../utils/mocks/civilClaimResponseMock.json');
  const claim = new Claim();
  const mockClaimId = '5129';
  const lang = 'en';
  const caseData = Object.assign(claim, mockClaim.case_data);
  const actualLatestUpdateContent = getLatestUpdateContent(mockClaimId, caseData, lang);
  it('should return response to claim section latest update content', () => {
    //when
    const responseToClaimSection = buildResponseToClaimSection(caseData, lang, mockClaimId);
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
});
