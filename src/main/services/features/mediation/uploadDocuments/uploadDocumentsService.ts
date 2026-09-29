import {Claim} from 'models/claim';
import {TypeOfMediationDocuments, UploadDocuments} from 'models/mediation/uploadDocuments/uploadDocuments';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {Request} from 'express';
import {
  MediationTypeOfDocumentSection,
  TypeOfDocumentYourNameSection,
  UploadDocumentsForm,
} from 'form/models/mediation/uploadDocuments/uploadDocumentsForm';
import {CaseDocument} from 'models/document/caseDocument';
import {migrateLegacyCaseDocuments, normaliseCaseDocuments} from 'common/utils/fileUploadUtils';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('freeMediationService');
const CASE_DOCUMENTS = 'caseDocuments';
const CASE_DOCUMENT_LEGACY = 'caseDocument';

export const getUploadDocuments = (claim: Claim): UploadDocuments => {
  try {
    if (!claim.mediationUploadDocuments) return new UploadDocuments([]);
    claim.mediationUploadDocuments.typeOfDocuments?.forEach((typeOfDocument) => migrateLegacyCaseDocuments(typeOfDocument.uploadDocuments));
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
  const documentsForYourStatement: TypeOfDocumentYourNameSection[] = getFormSection<TypeOfDocumentYourNameSection>(req.body.documentsForYourStatement, bindRequestYourNameSectionObj);
  const documentsForDocumentsReferred: MediationTypeOfDocumentSection[] = getFormSection<MediationTypeOfDocumentSection>(req.body.documentsForDocumentsReferred, bindRequestToTypeOfDocumentSectionObj);

  return new UploadDocumentsForm(documentsForYourStatement, documentsForDocumentsReferred);
};

export const addAnother = (uploadDocuments: UploadDocumentsForm, type: TypeOfMediationDocuments ) => {
  const typeOfDocumentSection = new MediationTypeOfDocumentSection('','','');
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

const parseCaseDocuments = (request: any): CaseDocument[] => {
  // Falls back to the pre-multi-file-upload field name so a browser tab that loaded the page
  // before this change shipped doesn't silently lose its already-uploaded document on submit.
  const rawCaseDocs = request[CASE_DOCUMENTS] || request[CASE_DOCUMENT_LEGACY];
  if (!rawCaseDocs || rawCaseDocs === '') {
    return [];
  }
  return normaliseCaseDocuments(JSON.parse(rawCaseDocs) as CaseDocument | CaseDocument[]);
};

const bindRequestToTypeOfDocumentSectionObj = (request: any): MediationTypeOfDocumentSection => {
  const formObj: MediationTypeOfDocumentSection = new MediationTypeOfDocumentSection(request['dateInputFields'].dateDay, request['dateInputFields'].dateMonth, request['dateInputFields'].dateYear);
  formObj.typeOfDocument = request['typeOfDocument'].trim();
  formObj.caseDocuments = parseCaseDocuments(request);
  return formObj;
};

const bindRequestYourNameSectionObj = (request: any): TypeOfDocumentYourNameSection => {
  const formObj: TypeOfDocumentYourNameSection = new TypeOfDocumentYourNameSection(request['dateInputFields'].dateDay, request['dateInputFields'].dateMonth, request['dateInputFields'].dateYear);
  formObj.yourName = request['yourName'].trim();
  formObj.caseDocuments = parseCaseDocuments(request);
  return formObj as TypeOfDocumentYourNameSection;
};
