import {Claim} from 'models/claim';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {getWitnessTitle,getWitnessYourStatement} from 'services/features/caseProgression/witnessSection';

export const buildWitnessSection = (claim: Claim, claimId: string): ClaimSummarySection[] => {
  const sectionContent = [];
  const witnessTitle = getWitnessTitle();
  const witnessYourStatementContent = getWitnessYourStatement();

  sectionContent.push(witnessTitle);
  sectionContent.push(witnessYourStatementContent);

  return sectionContent.flat();
};
