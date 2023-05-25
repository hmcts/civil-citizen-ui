import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {Claim} from 'models/claim';

import {
  buildDisclosureDocumentSection,
  buildDisclosureListSection,
} from 'services/features/caseProgression/disclosureContentBuilder';

export const getDisclosureContent = (claim: Claim): ClaimSummaryContent[] => {
  const sectionContent = [];

  if(claim?.caseProgression?.defendantUploadDocuments?.disclosure[0]?.selected){
    const disclosureSection = buildDisclosureDocumentSection();
    const disclosureContent = [disclosureSection];
    sectionContent.push(disclosureContent);
  }

  if(claim?.caseProgression?.defendantUploadDocuments?.disclosure[1]?.selected){
    const disclosureListSection = buildDisclosureListSection();
    const disclosureListContent = [disclosureListSection];
    sectionContent.push(disclosureListContent);
  }

  return sectionContent.flat().map((sectionContent, index) => ({
    contentSections: sectionContent,
    hasDivider: index < sectionContent.length - 1,
  }));
};
