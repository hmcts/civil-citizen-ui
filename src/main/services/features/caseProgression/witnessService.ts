import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {Claim} from 'models/claim';

import {buildWitnessSection} from 'services/features/caseProgression/witnessContentBuilder';
import {EvidenceUploadWitness} from 'models/document/documentType';

export const getWitnessContent = (claimId: string, claim: Claim, documentTypes: any): ClaimSummaryContent[] => {
  const sectionContent = [];

  if (documentTypes.includes(EvidenceUploadWitness.WITNESS_STATEMENT)) {
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
