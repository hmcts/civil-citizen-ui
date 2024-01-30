import {Claim} from 'models/claim';
import {TypeOfMediationDocuments, UploadDocuments} from 'models/mediation/uploadDocuments/uploadDocuments';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {Request} from 'express';
import {
  TypeOfDocumentSection, } from 'models/caseProgression/uploadDocumentsUserForm';
import {
  TypeOfDocumentYourNameSection,
  UploadDocumentsForm,
} from 'form/models/mediation/uploadDocuments/uploadDocumentsForm';
import {CaseDocument} from 'models/document/caseDocument';


const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('freeMediationService');
const CASE_DOCUMENT = 'caseDocument';

export const getUploadDocuments = (claim: Claim): UploadDocuments => {
  try {
    if (!claim.mediationUploadDocuments) return new UploadDocuments([]);
    return new UploadDocuments(claim.mediationUploadDocuments.typeOfDocuments);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveUploadDocument = async (claimId: string, value: any, uploadDocumentsPropertyName: keyof UploadDocuments): Promise<void> => {
  try {
    const claim: Claim = await getCaseDataFromStore(claimId);

    if (!claim.mediationUploadDocuments) {
      claim.mediationUploadDocuments = new UploadDocuments(value);
    }else {
      claim.mediationUploadDocuments[uploadDocumentsPropertyName] = value;
    }

    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getUploadDocumentsForm = (req: Request): UploadDocumentsForm => {
  const documentsForYourStatement: TypeOfDocumentYourNameSection[] = getFormSection<TypeOfDocumentSection>(req.body.documentsForYourStatement, bindRequestYourNameSectionObj);
  const documentsForDocumentsReferred: TypeOfDocumentSection[] = getFormSection<TypeOfDocumentSection>(req.body.documentsForDocumentsReferred, bindRequestToTypeOfDocumentSectionObj);

  return new UploadDocumentsForm(documentsForYourStatement, documentsForDocumentsReferred);
};

export const addAnother = (uploadDocuments: UploadDocumentsForm, type: TypeOfMediationDocuments ) => {
  const typeOfDocumentSection = new TypeOfDocumentSection('','','');
  const typeOfDocumentYourNameSection = new TypeOfDocumentYourNameSection('','','');
  if(type === TypeOfMediationDocuments.YOUR_STATEMENT){
    uploadDocuments.documentsForYourStatement.push(typeOfDocumentYourNameSection);
  } else if(type === TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT){
    uploadDocuments.documentsForDocumentsReferred.push(typeOfDocumentSection);
  }
};

export const removeItem = (uploadDocuments: UploadDocumentsForm, action: string  ) => {
  const [category,index] = action.split(/[[\]]/).filter((word: string) => word !== '');

  if(category === 'documentsForYourStatement'){
    uploadDocuments.documentsForYourStatement.splice(Number(index),1);
  } else if(category === 'documentsForDocumentsReferred'){
    uploadDocuments.documentsForDocumentsReferred.splice(Number(index),1);
  }
};

const getFormSection = <T>(data: any[], bindFunction: (request: any) => T): T[] => {
  const formSection: T[] = [];
  data?.forEach(function (request: any) {
    formSection.push(bindFunction(request));
  });
  return formSection;
};

const bindRequestToTypeOfDocumentSectionObj = (request: any): TypeOfDocumentSection => {
  const formObj: TypeOfDocumentSection = new TypeOfDocumentSection(request['dateInputFields'].dateDay, request['dateInputFields'].dateMonth, request['dateInputFields'].dateYear);
  formObj.typeOfDocument = request['typeOfDocument'].trim();
  if (request[CASE_DOCUMENT] && request[CASE_DOCUMENT] !== '') {
    formObj.caseDocument = JSON.parse(request[CASE_DOCUMENT]) as CaseDocument;
  }
  return formObj;
};

const bindRequestYourNameSectionObj = (request: any): TypeOfDocumentYourNameSection => {
  const formObj: TypeOfDocumentYourNameSection = new TypeOfDocumentYourNameSection(request['dateInputFields'].dateDay, request['dateInputFields'].dateMonth, request['dateInputFields'].dateYear);
  formObj.typeOfDocument = request['typeOfDocument'].trim();
  if (request[CASE_DOCUMENT] && request[CASE_DOCUMENT] !== '') {
    formObj.caseDocument = JSON.parse(request[CASE_DOCUMENT]) as CaseDocument;
  }
  return formObj;
};

/*export const saveUploadedDocuments = async (claim: Claim, req: AppRequest): Promise<Claim> => {
  let newUploadDocuments: UploadDocumentsForm;
  let existingUploadDocuments: UploadDocuments;
  const caseProgression = new CaseProgression();
  let updatedCcdClaim = {} as CCDClaim;
  const oldClaim = await civilServiceClient.retrieveClaimDetails(claim.id, req);
  /!*const t = claim.mediationUploadDocuments.typeOfDocuments.find(document => document.type === TypeOfMediationDocuments.YOUR_STATEMENT) as TypeOfDocumentYourNameSection;
  newUploadDocuments.documentsForYourStatement = t
  existingUploadDocuments = oldClaim.mediationUploadDocuments.typeOfDocuments;
  caseProgression.defendantUploadDocuments =  mapUploadedFileToDocumentType(newUploadDocuments, existingUploadDocuments);
  updatedCcdClaim = toCCDEvidenceUpload(caseProgression, updatedCcdClaim, false);*!/
  return await civilServiceClient.submitEvent(CaseEvent.EVIDENCE_UPLOAD_RESPONDENT, claim.id, updatedCcdClaim, req);
};
const mapUploadedFileToDocumentType = (newUploadedDocuments: UploadDocumentsUserForm, existingUploadDocuments: UploadDocuments): UploadDocuments => {

  if(newUploadedDocuments.documentsForDisclosure){
    for(const document of newUploadedDocuments.documentsForDisclosure) {
      const documentType = EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE;
      const documentToUpload = new UploadEvidenceDocumentType(null, document.typeOfDocument, document.dateInputFields.date, document.caseDocument.documentLink, document.caseDocument.createdDatetime);
      existingUploadDocuments.disclosure.push(new UploadDocumentTypes(null, documentToUpload, documentType, null));
    }
  }
  if(newUploadedDocuments.disclosureList){
    for(const document of newUploadedDocuments.disclosureList) {
      const documentType = EvidenceUploadDisclosure.DISCLOSURE_LIST;
      const documentToUpload = new UploadEvidenceDocumentType(null,null, null, document.caseDocument.documentLink, document.caseDocument.createdDatetime);
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
      const documentToUpload = new UploadEvidenceDocumentType(document.witnessName, document.typeOfDocument, document.dateInputFields.date, document.caseDocument.documentLink, document.caseDocument.createdDatetime);
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
      const documentToUpload = new UploadEvidenceDocumentType(null, null, null, document.caseDocument.documentLink, document.caseDocument.createdDatetime);
      existingUploadDocuments.trial.push(new UploadDocumentTypes(null, documentToUpload, documentType, null));
    }
  }

  if(newUploadedDocuments.trialSkeletonArgument){
    for(const document of newUploadedDocuments.trialSkeletonArgument){
      const documentType = EvidenceUploadTrial.SKELETON_ARGUMENT;
      const documentToUpload = new UploadEvidenceDocumentType(null,null, null, document.caseDocument.documentLink, document.caseDocument.createdDatetime);
      existingUploadDocuments.trial.push(new UploadDocumentTypes(null, documentToUpload, documentType, null));
    }
  }

  if(newUploadedDocuments.trialAuthorities){
    for(const document of newUploadedDocuments.trialAuthorities){
      const documentType = EvidenceUploadTrial.AUTHORITIES;
      const documentToUpload = new UploadEvidenceDocumentType(null,null, null, document.caseDocument.documentLink, document.caseDocument.createdDatetime);
      existingUploadDocuments.trial.push(new UploadDocumentTypes(null, documentToUpload, documentType, null));
    }
  }

  if(newUploadedDocuments.trialCosts){
    for(const document of newUploadedDocuments.trialCosts){
      const documentType = EvidenceUploadTrial.COSTS;
      const documentToUpload = new UploadEvidenceDocumentType(null,null, null, document.caseDocument.documentLink, document.caseDocument.createdDatetime);
      existingUploadDocuments.trial.push(new UploadDocumentTypes(null, documentToUpload, documentType, null));
    }
  }

  if(newUploadedDocuments.trialDocumentary){
    for(const document of newUploadedDocuments.trialDocumentary){
      const documentType = EvidenceUploadTrial.DOCUMENTARY;
      const documentToUpload = new UploadEvidenceDocumentType(null, document.typeOfDocument, document.dateInputFields.date, document.caseDocument.documentLink, document.caseDocument.createdDatetime);
      existingUploadDocuments.trial.push(new UploadDocumentTypes(null, documentToUpload, documentType, null));
    }
  }

  return existingUploadDocuments;
};*/
