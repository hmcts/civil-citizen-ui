import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {Claim} from 'models/claim';

import {buildWitnessSection} from 'services/features/caseProgression/witnessContentBuilder';

export const getWitnessContent = (claimId: string, claim: Claim): ClaimSummaryContent[] => {
  const sectionContent = [];

  if(claim?.caseProgression?.defendantUploadDocuments?.witness[1]?.selected) {
    const witnessSection = buildWitnessSection(claim, claimId);
    const witnessContent = [witnessSection];

    const filteredWitnessContent = witnessContent.filter(sectionContent => sectionContent.length);
    sectionContent.push(filteredWitnessContent);
  }

  return sectionContent.flat().map((sectionContent, index) => {
    return ({
      contentSections: sectionContent,
      hasDivider: index < sectionContent.length - 1,
    });
  });
};
