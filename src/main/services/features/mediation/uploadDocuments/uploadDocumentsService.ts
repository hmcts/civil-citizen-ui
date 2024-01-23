import {Claim} from 'models/claim';
import {TypeOfMediationDocuments, UploadDocuments} from 'models/mediation/uploadDocuments/uploadDocuments';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {Request} from 'express';
import {
  TypeOfDocumentSection,
} from 'models/caseProgression/uploadDocumentsUserForm';
import {UploadDocumentsForm} from 'form/models/mediation/uploadDocuments/uploadDocumentsForm';
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
  const documentsForYourStatement = getFormSection<TypeOfDocumentSection>(req.body.documentsForYourStatement, bindRequestToTypeOfDocumentSectionObj);
  return new UploadDocumentsForm(documentsForYourStatement, null);
};

export const addAnother = (uploadDocuments: UploadDocumentsForm, type: TypeOfMediationDocuments ) => {
  const newObject = new TypeOfDocumentSection('','','')
  if(type === TypeOfMediationDocuments.YOUR_STATEMENT){
    uploadDocuments.documentsForYourStatement.push(newObject);
  } else if(type === TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT){
    uploadDocuments.documentsForDocumentsReferred.push(newObject);
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
    formObj.caseDocument = JSON.parse(request['caseDocument']) as CaseDocument;
  }
  return formObj;
};
