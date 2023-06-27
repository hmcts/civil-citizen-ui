import {ClaimSummaryContent, ClaimSummarySection} from 'form/models/claimSummarySection';
import {Claim} from 'models/claim';
import {buildDownloadSealedClaimSection} from './claimDocuments/claimDocumentContentBuilder';
import {DocumentTab, getEvidenceUploadDocuments} from 'services/features/caseProgression/documentTableBuilder';

function getDocumentsContent(claim: Claim, claimId: string, lang?: string): ClaimSummaryContent[] {
  const downloadClaimSection = buildDownloadSealedClaimSection(claim, claimId, lang);
  return [{
    contentSections: [
      downloadClaimSection,
    ],
  }];
}

function getEvidenceUploadContent(claim: Claim): ClaimSummaryContent[]{

  const tables: DocumentTab = getEvidenceUploadDocuments(claim);
  const downloadEvidenceUploadDocuments = [] as ClaimSummarySection[];

  if(tables.claimantDisclosure) downloadEvidenceUploadDocuments.push(tables.claimantDisclosure);
  if(tables.defendantDisclosure) downloadEvidenceUploadDocuments.push(tables.defendantDisclosure);
  if(tables.claimantWitness) downloadEvidenceUploadDocuments.push(tables.claimantWitness);
  if(tables.defendantWitness) downloadEvidenceUploadDocuments.push(tables.defendantWitness);
  if(tables.claimantExpert) downloadEvidenceUploadDocuments.push(tables.claimantExpert);
  if(tables.defendantExpert) downloadEvidenceUploadDocuments.push(tables.defendantExpert);
  if(tables.claimantTrial) downloadEvidenceUploadDocuments.push(tables.claimantTrial);
  if(tables.defendantTrial) downloadEvidenceUploadDocuments.push(tables.defendantTrial);

  return [{
    contentSections: downloadEvidenceUploadDocuments,
  }];
}

export {getDocumentsContent, getEvidenceUploadContent};
