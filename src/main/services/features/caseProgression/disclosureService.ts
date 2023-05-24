import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {Claim} from 'models/claim';

import {
  buildDisclosureDocumentSection,
  buildDisclosureListSection,
} from 'services/features/caseProgression/disclosureContentBuilder';

export const getDisclosureContent = (claimId: string, claim: Claim): ClaimSummaryContent[] => {
  const sectionContent = [];

  //todo: wrap in if (should we show this section)
  const disclosureSection = buildDisclosureDocumentSection(claim, claimId);
  const disclosureContent = [disclosureSection];
  sectionContent.push(disclosureContent);

  //todo: wrap in if (should we show this section)
  const disclosureListSection = buildDisclosureListSection(claim, claimId);
  const disclosureListContent = [disclosureListSection];
  sectionContent.push(disclosureListContent);

  return sectionContent.flat().map((sectionContent, index) => ({
    contentSections: sectionContent,
    hasDivider: index < sectionContent.length - 1,
  }));
};
