import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {Claim} from 'models/claim';
import {
  buildResponseToClaimSection,
} from './latestUpdate/latestUpdateContentBuilder';
jest.mock('../../../../../main/modules/i18n/languageService', () => ({
  getLanguage: jest.fn().mockReturnValue('en'),
  setLanguage: jest.fn(),
}));
export const getLatestUpdateContent = (claimId: string, claim: Claim): ClaimSummaryContent[] => {
  const responseToClaimSection = buildResponseToClaimSection(claim, claimId);
  const latestUpdateContent = [responseToClaimSection];

  const filteredLatestUpdateContent = latestUpdateContent.filter(sectionContent => sectionContent.length);
  return filteredLatestUpdateContent.map((sectionContent, index) => {
    return ({
      contentSections: sectionContent,
      hasDivider: index < filteredLatestUpdateContent.length - 1,
    });
  });
};
