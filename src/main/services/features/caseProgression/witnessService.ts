import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {Claim} from 'models/claim';

import {
  buildDocumentsInStatement,
  buildNoticeOfHearsayEvidence,
  buildWitnessStatement, buildWitnessSummary,
} from 'services/features/caseProgression/witnessContentBuilder';

export const getWitnessContent = (claim: Claim): ClaimSummaryContent[] => {
  const sectionContent = [];

  if (claim.caseProgression?.defendantUploadDocuments?.witness[0]?.selected){
    sectionContent.push([buildWitnessStatement()]);
  }

  if (claim.caseProgression?.defendantUploadDocuments?.witness[1]?.selected){
    sectionContent.push([buildWitnessSummary()]);
  }

  if (claim.caseProgression?.defendantUploadDocuments?.witness[2]?.selected){
    sectionContent.push([buildNoticeOfHearsayEvidence()]);
  }

  if (claim.caseProgression?.defendantUploadDocuments?.witness[3]?.selected){
    sectionContent.push([buildDocumentsInStatement()]);
  }

  return sectionContent.flat().map((sectionContent, index) => ({
    contentSections: sectionContent,
    hasDivider: index < sectionContent.length - 1,
  }));
};
