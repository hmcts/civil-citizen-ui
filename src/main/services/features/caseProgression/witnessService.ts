import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {Claim} from 'models/claim';

import {
  buildDocumentsInStatement,
  buildNoticeOfHearsayEvidence,
  buildWitnessStatement, buildWitnessSummary,
  buildYourStatement,
} from 'services/features/caseProgression/witnessContentBuilder';
import {UploadDocuments} from 'models/caseProgression/uploadDocumentsType';

export const getWitnessContent = (claim: Claim): ClaimSummaryContent[] => {
  const sectionContent = [];

  const defendant = claim?.caseProgression?.defendantUploadDocuments;
  const defendantUploadDocuments = new UploadDocuments(defendant.disclosure, defendant.witness, defendant.expert,defendant.trial);

  if (defendantUploadDocuments.witness?.[0].selected){
    sectionContent.push([buildYourStatement()]);
  }

  if (defendantUploadDocuments.witness?.[1].selected){
    sectionContent.push([buildWitnessStatement()]);
  }

  if (defendantUploadDocuments.witness?.[2].selected){
    sectionContent.push([buildWitnessSummary()]);
  }

  if (defendantUploadDocuments.witness?.[3].selected){
    sectionContent.push([buildNoticeOfHearsayEvidence()]);
  }

  if (defendantUploadDocuments.witness?.[4].selected){
    sectionContent.push([buildDocumentsInStatement()]);
  }

  return sectionContent.flat().map((sectionContent, index) => ({
    contentSections: sectionContent,
    hasDivider: index < sectionContent.length - 1,
  }));
};
