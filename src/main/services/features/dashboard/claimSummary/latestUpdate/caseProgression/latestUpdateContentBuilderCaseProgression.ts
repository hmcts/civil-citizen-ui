import {Claim} from 'models/claim';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {LatestUpdateSectionBuilder} from 'models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';

export const buildResponseToClaimSectionCaseProgression = (claim: Claim, claimId: string): ClaimSummarySection[][] => {
  const sectionContent = [];
  const section = new LatestUpdateSectionBuilder().addTitle('leo').build();
  sectionContent.push(section);
  sectionContent.push(section);
  sectionContent.push(section);
  sectionContent.push(section);

  return sectionContent;
};
