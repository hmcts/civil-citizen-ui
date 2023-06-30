import {Claim} from 'models/claim';
import {ClaimSummaryContent, ClaimSummarySection} from 'form/models/claimSummarySection';
import {
  buildEvidenceUploadSection, buildHearingTrialLatestUploadSection, buildNewUploadSection,
} from 'services/features/dashboard/claimSummary/latestUpdate/caseProgression/latestUpdateContentBuilderCaseProgression';
import {checkEvidenceUploadTime} from 'common/utils/dateUtils';
import {UploadDocuments, UploadDocumentTypes} from 'models/caseProgression/uploadDocumentsType';

export const getCaseProgressionLatestUpdates = (claim: Claim, lang: string) : ClaimSummaryContent[] => {
  const sectionContent = [];
  if(checkEvidenceUploaded(claim, false)){
    sectionContent.push(getNewUploadLatestUpdateContent(claim));
  }
  if(claim.hasCaseProgressionHearingDocuments()){
    sectionContent.push(getHearingTrialUploadLatestUpdateContent(claim, lang));
    sectionContent.push(getEvidenceUploadLatestUpdateContent(claim.id, claim));
  }
  return getClaimSummaryContent(sectionContent.flat());
};

export const checkEvidenceUploaded = (claim: Claim, isClaimant: boolean): boolean => {
  if(isClaimant){
    return checkEvidenceUploadedByOtherParty(claim.caseProgression?.defendantUploadDocuments);
  }else {
    return checkEvidenceUploadedByOtherParty(claim.caseProgression?.claimantUploadDocuments);
  }
};

const checkEvidenceUploadedByOtherParty = (uploadedDocuments: UploadDocuments): boolean => {
  let isNew = false;
  const documents = [] as UploadDocumentTypes[][];
  documents.push(uploadedDocuments.disclosure);
  documents.push(uploadedDocuments.witness);
  documents.push(uploadedDocuments.expert);
  documents.push(uploadedDocuments.trial);

  for(const documentList of documents){
    for(const document of documentList){
      if(checkEvidenceUploadTime(document.caseDocument?.createdDatetime))
      {
        isNew = true;
        break;
      }
    }

    if(isNew.valueOf() == true){
      break;
    }
  }

  return isNew;
};

export const getNewUploadLatestUpdateContent = (claim: Claim): ClaimSummarySection[][] => {
  return buildNewUploadSection(claim);
};

export const getEvidenceUploadLatestUpdateContent = (claimId: string, claim: Claim): ClaimSummarySection[][] => {
  return buildEvidenceUploadSection(claim);
};

export const getHearingTrialUploadLatestUpdateContent = (claim: Claim, lang: string): ClaimSummarySection[][] => {
  return buildHearingTrialLatestUploadSection(claim, lang);
};

export const getClaimSummaryContent = (section: ClaimSummarySection[][]) : ClaimSummaryContent[] => {
  return section.map((sectionContent, index) => ({
    contentSections: sectionContent,
    hasDivider: index < section.length - 1,
  }));
};
