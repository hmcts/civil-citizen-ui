import {ClaimSummaryContent} from '../../../../common/form/models/claimSummarySection';
import {Claim} from '../../../../common/models/claim';
import {
  buildResponseToClaimSection,
  buildExampleSectionOne,
  buildExampleSectionTwo,
} from './latestUpdate/latestUpdateContentBuilder';

export const getLatestUpdateContent = (claimId: string, claim: Claim, lang: string): ClaimSummaryContent[] => {
  const responseToClaimSection = buildResponseToClaimSection(claim, lang, claimId);
  //TODO: concept section as an example, needs to be replaced with new sections to be developed 
  const exampleSectionOne = buildExampleSectionOne(claim, lang, claimId);
  //TODO: concept section as an example, needs to be replaced with new sections to be developed 
  const exampleSectionTwo = buildExampleSectionTwo(claim, lang, claimId);
  const latestUpdateContent = [responseToClaimSection, exampleSectionOne, exampleSectionTwo];

  const filteredLatestUpdateContent = latestUpdateContent.filter(sectionContent => sectionContent.length);
  return filteredLatestUpdateContent.map((sectionContent, index) => {
    return ({
      contentSections: sectionContent,
      hasDivider: index < filteredLatestUpdateContent.length - 1,
    });
  });
};
