import {Claim} from 'models/claim';
import {
  getDisclosureSummarySection,
  getExpertSummarySection,
  getTrialSummarySection,
  getWitnessSummarySection,
} from 'services/features/caseProgression/checkYourAnswers/buildEvidenceUploadedSummaryRows';
import {documentUploadSections} from 'models/caseProgression/documentUploadSections';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {
  FinaliseYourTrialSectionBuilder,
} from 'models/caseProgression/trialArrangements/finaliseYourTrialSectionBuilder';
import {UploadDocumentsUserForm} from 'models/caseProgression/uploadDocumentsUserForm';
import {
  UploadDocuments,
  UploadDocumentTypes,
  UploadEvidenceDocumentType,
  UploadEvidenceExpert,
  UploadEvidenceWitness,
} from 'models/caseProgression/uploadDocumentsType';
import {
  EvidenceUploadDisclosure,
  EvidenceUploadExpert,
  EvidenceUploadTrial,
  EvidenceUploadWitness,
} from 'models/document/documentType';
import {CCDClaim} from 'models/civilClaimResponse';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {toCCDEvidenceUpload} from 'services/translation/caseProgression/convertToCCDEvidenceUpload';
import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {CaseEvent} from 'models/events/caseEvent';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

export const getSummarySections = (uploadedDocuments: UploadDocumentsUserForm, claimId: string, isSmallClaims: boolean, lang: string | unknown): documentUploadSections => {

  return {
    witnessEvidenceSection: getWitnessSummarySection(uploadedDocuments, claimId, lang),
    disclosureEvidenceSection: getDisclosureSummarySection(uploadedDocuments, claimId, lang),
    expertEvidenceSection: getExpertSummarySection(uploadedDocuments, claimId, lang),
    trialEvidenceSection: getTrialSummarySection(uploadedDocuments, isSmallClaims, claimId, lang),
  };
};

export const getTopElements = (claim:Claim): ClaimSummarySection[] => {

  return new PageSectionBuilder()
    .addMainTitle('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.CHECK_YOUR_ANSWERS_TITLE')
    .addLeadParagraph('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.CASE_REFERENCE_NUMBER', {caseNumber: claim.id})
    .addLeadParagraph('COMMON.PARTIES', {claimantName: claim.getClaimantFullName(), defendantName: claim.getDefendantFullName()})
    .addInsetText('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.CHECK_YOUR_ANSWERS_WARNING_FULL')
    .build();
};

export const getBottomElements = (): ClaimSummarySection[] => {

  return new FinaliseYourTrialSectionBuilder()
    .addMainTitle('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.CHECK_YOUR_ANSWERS_CONFIRMATION')
    .addWarning('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.CHECK_YOUR_ANSWERS_WARNING_SHORT')
    .build();
};

export const saveUploadedDocuments = async (claim: Claim, req: AppRequest): Promise<Claim> => {
  let newUploadDocuments: UploadDocumentsUserForm;
  let existingUploadDocuments: UploadDocuments;
  const caseProgression = new CaseProgression();
  let updatedCcdClaim = {} as CCDClaim;
  const oldClaim = await civilServiceClient.retrieveClaimDetails(claim.id, req);

  if(claim.isClaimant())
  {
    newUploadDocuments = claim.caseProgression.claimantDocuments;
    existingUploadDocuments = oldClaim.caseProgression.claimantUploadDocuments;
    caseProgression.claimantUploadDocuments = mapUploadedFileToDocumentType(newUploadDocuments, existingUploadDocuments);
    updatedCcdClaim = toCCDEvidenceUpload(caseProgression, updatedCcdClaim, true);
    return await civilServiceClient.submitEvent(CaseEvent.EVIDENCE_UPLOAD_APPLICANT, claim.id, updatedCcdClaim, req);
  } else {
    newUploadDocuments = claim.caseProgression.defendantDocuments;
    existingUploadDocuments = oldClaim.caseProgression.defendantUploadDocuments;
    caseProgression.defendantUploadDocuments =  mapUploadedFileToDocumentType(newUploadDocuments, existingUploadDocuments);
    updatedCcdClaim = toCCDEvidenceUpload(caseProgression, updatedCcdClaim, false);
    return await civilServiceClient.submitEvent(CaseEvent.EVIDENCE_UPLOAD_RESPONDENT, claim.id, updatedCcdClaim, req);
  }
};

const mapUploadedFileToDocumentType = (newUploadedDocuments: UploadDocumentsUserForm, existingUploadDocuments: UploadDocuments): UploadDocuments => {

  if(newUploadedDocuments.documentsForDisclosure){
    for(const document of newUploadedDocuments.documentsForDisclosure) {
      const documentType = EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE;
      const documentToUpload = new UploadEvidenceDocumentType(document.typeOfDocument, document.dateInputFields.date, document.caseDocument.documentLink, document.caseDocument.createdDatetime);
      existingUploadDocuments.disclosure.push(new UploadDocumentTypes(null, documentToUpload, documentType, null));
    }
  }
  if(newUploadedDocuments.disclosureList){
    for(const document of newUploadedDocuments.disclosureList) {
      const documentType = EvidenceUploadDisclosure.DISCLOSURE_LIST;
      const documentToUpload = new UploadEvidenceDocumentType(null, null, document.caseDocument.documentLink, document.caseDocument.createdDatetime);
      existingUploadDocuments.disclosure.push(new UploadDocumentTypes(null, documentToUpload, documentType, null));
    }
  }

  if(newUploadedDocuments.witnessStatement){
    for(const document of newUploadedDocuments.witnessStatement){
      const documentType = EvidenceUploadWitness.WITNESS_STATEMENT;
      const documentToUpload = new UploadEvidenceWitness(document.witnessName, document.dateInputFields.date, document.caseDocument.documentLink, document.caseDocument.createdDatetime);
      existingUploadDocuments.witness.push(new UploadDocumentTypes(null, documentToUpload, documentType, null));
    }
  }

  if(newUploadedDocuments.witnessSummary) {
    for(const document of newUploadedDocuments.witnessSummary){
      const documentType = EvidenceUploadWitness.WITNESS_SUMMARY;
      const documentToUpload = new UploadEvidenceWitness(document.witnessName, document.dateInputFields.date, document.caseDocument.documentLink, document.caseDocument.createdDatetime);
      existingUploadDocuments.witness.push(new UploadDocumentTypes(null, documentToUpload, documentType, null));
    }
  }

  if(newUploadedDocuments.noticeOfIntention) {
    for(const document of newUploadedDocuments.noticeOfIntention){
      const documentType = EvidenceUploadWitness.NOTICE_OF_INTENTION;
      const documentToUpload = new UploadEvidenceWitness(document.witnessName, document.dateInputFields.date, document.caseDocument.documentLink, document.caseDocument.createdDatetime);
      existingUploadDocuments.witness.push(new UploadDocumentTypes(null, documentToUpload, documentType, null));
    }
  }

  if(newUploadedDocuments.documentsReferred) {
    for(const document of newUploadedDocuments.documentsReferred){
      const documentType = EvidenceUploadWitness.DOCUMENTS_REFERRED;
      const documentToUpload = new UploadEvidenceDocumentType(document.typeOfDocument, document.dateInputFields.date, document.caseDocument.documentLink, document.caseDocument.createdDatetime);
      existingUploadDocuments.witness.push(new UploadDocumentTypes(null, documentToUpload, documentType, null));
    }
  }

  if(newUploadedDocuments.expertStatement){
    for(const document of newUploadedDocuments.expertStatement){
      const documentType = EvidenceUploadExpert.STATEMENT;
      const documentToUpload = new UploadEvidenceExpert(document.expertName, null, document.fieldOfExpertise, null, null, null, document.dateInputFields.date, document.caseDocument.documentLink, document.caseDocument.createdDatetime);
      existingUploadDocuments.expert.push(new UploadDocumentTypes(null, documentToUpload, documentType, null));
    }
  }

  if(newUploadedDocuments.expertReport){
    for(const document of newUploadedDocuments.expertReport){
      const documentType = EvidenceUploadExpert.EXPERT_REPORT;
      const documentToUpload = new UploadEvidenceExpert(document.expertName, document.fieldOfExpertise, null, null, null, null, document.dateInputFields.date, document.caseDocument.documentLink, document.caseDocument.createdDatetime);
      existingUploadDocuments.expert.push(new UploadDocumentTypes(null, documentToUpload, documentType, null));
    }
  }

  if(newUploadedDocuments.questionsForExperts){
    for(const document of newUploadedDocuments.questionsForExperts){
      const documentType = EvidenceUploadExpert.QUESTIONS_FOR_EXPERTS;
      const documentToUpload = new UploadEvidenceExpert(document.expertName, document.fieldOfExpertise, null, document.otherPartyName, document.questionDocumentName, null, new Date(), document.caseDocument.documentLink, document.caseDocument.createdDatetime);
      existingUploadDocuments.expert.push(new UploadDocumentTypes(null, documentToUpload, documentType, null));
    }
  }

  if(newUploadedDocuments.answersForExperts){
    for(const document of newUploadedDocuments.answersForExperts){
      const documentType = EvidenceUploadExpert.ANSWERS_FOR_EXPERTS;
      const documentToUpload = new UploadEvidenceExpert(document.expertName, document.fieldOfExpertise, null, document.otherPartyName, null, document.otherPartyQuestionsDocumentName, new Date(), document.caseDocument.documentLink, document.caseDocument.createdDatetime);
      existingUploadDocuments.expert.push(new UploadDocumentTypes(null, documentToUpload, documentType, null));
    }
  }

  if(newUploadedDocuments.trialCaseSummary){
    for(const document of newUploadedDocuments.trialCaseSummary){
      const documentType = EvidenceUploadTrial.CASE_SUMMARY;
      const documentToUpload = new UploadEvidenceDocumentType(null, null, document.caseDocument.documentLink, document.caseDocument.createdDatetime);
      existingUploadDocuments.trial.push(new UploadDocumentTypes(null, documentToUpload, documentType, null));
    }
  }

  if(newUploadedDocuments.trialSkeletonArgument){
    for(const document of newUploadedDocuments.trialSkeletonArgument){
      const documentType = EvidenceUploadTrial.SKELETON_ARGUMENT;
      const documentToUpload = new UploadEvidenceDocumentType(null, null, document.caseDocument.documentLink, document.caseDocument.createdDatetime);
      existingUploadDocuments.trial.push(new UploadDocumentTypes(null, documentToUpload, documentType, null));
    }
  }

  if(newUploadedDocuments.trialAuthorities){
    for(const document of newUploadedDocuments.trialAuthorities){
      const documentType = EvidenceUploadTrial.AUTHORITIES;
      const documentToUpload = new UploadEvidenceDocumentType(null, null, document.caseDocument.documentLink, document.caseDocument.createdDatetime);
      existingUploadDocuments.trial.push(new UploadDocumentTypes(null, documentToUpload, documentType, null));
    }
  }

  if(newUploadedDocuments.trialCosts){
    for(const document of newUploadedDocuments.trialCosts){
      const documentType = EvidenceUploadTrial.COSTS;
      const documentToUpload = new UploadEvidenceDocumentType(null, null, document.caseDocument.documentLink, document.caseDocument.createdDatetime);
      existingUploadDocuments.trial.push(new UploadDocumentTypes(null, documentToUpload, documentType, null));
    }
  }

  if(newUploadedDocuments.trialDocumentary){
    for(const document of newUploadedDocuments.trialDocumentary){
      const documentType = EvidenceUploadTrial.DOCUMENTARY;
      const documentToUpload = new UploadEvidenceDocumentType(document.typeOfDocument, document.dateInputFields.date, document.caseDocument.documentLink, document.caseDocument.createdDatetime);
      existingUploadDocuments.trial.push(new UploadDocumentTypes(null, documentToUpload, documentType, null));
    }
  }

  return existingUploadDocuments;
};
