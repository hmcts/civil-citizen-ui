import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {Claim} from 'models/claim';

import {buildWitnessSection} from 'services/features/caseProgression/witnessContentBuilder';

export const getWitnessContent = (claim: Claim): ClaimSummaryContent[] => {
  const witnessSection = buildWitnessSection(claim);
  const witnessContent = [witnessSection];

  const filteredWitnessContent = witnessContent.filter(sectionContent => sectionContent.length);
  return filteredWitnessContent.map((sectionContent, index) => {
    return ({
      contentSections: sectionContent,
      hasDivider: index < filteredWitnessContent.length - 1,
    });
  });
};
