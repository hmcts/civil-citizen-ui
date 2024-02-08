import {AppRequest} from 'models/AppRequest';
import {TypeOfMediationDocuments, UploadDocuments} from 'models/mediation/uploadDocuments/uploadDocuments';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {CaseEvent} from 'models/events/caseEvent';
import {CCDClaim} from 'models/civilClaimResponse';
import {Claim} from 'models/claim';
import {
  MediationDocumentsReferred, MediationMediationNonAttendanceDocs,
  MediationUploadDocumentsCCD,
} from 'models/mediation/uploadDocuments/uploadDocumentsCCD';
import {TypeOfDocumentSection} from 'models/caseProgression/uploadDocumentsUserForm';
import {v4 as uuidv4} from 'uuid';
import {mapperMediationDocumentToCCDDocuments} from 'models/mediation/uploadDocuments/mapperCaseDocumentToCCDDocuments';
import {TypeOfDocumentYourNameSection} from 'form/models/mediation/uploadDocuments/uploadDocumentsForm';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const getMediationDocumentsReferredDocuments = (newMediationUploadDocuments: UploadDocuments, mediationUploadDocuments:MediationUploadDocumentsCCD[]) => {
  const newDocumentsReferred: TypeOfDocumentSection[] = newMediationUploadDocuments.typeOfDocuments.find((doc) => doc.type === TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT)?.uploadDocuments as TypeOfDocumentSection[];
  const newDocs =  newDocumentsReferred.map((newDoc) => {
    const mediationUploadDocumentsCCD = new MediationUploadDocumentsCCD();
    mediationUploadDocumentsCCD.id = uuidv4();
    mediationUploadDocumentsCCD.value = new MediationDocumentsReferred(mapperMediationDocumentToCCDDocuments(newDoc.caseDocument, 'DefendantOneMediationDocs'), newDoc.dateInputFields.date, newDoc.typeOfDocument, new Date());
    return mediationUploadDocumentsCCD;
  });
  return mediationUploadDocuments.concat(newDocs);
};

const getMediationNonAttendanceDocuments = (newMediationUploadDocuments: UploadDocuments, mediationUploadDocuments:MediationUploadDocumentsCCD[]) => {
  const newDocumentsReferred: TypeOfDocumentYourNameSection[] = newMediationUploadDocuments.typeOfDocuments.find((doc) => doc.type === TypeOfMediationDocuments.YOUR_STATEMENT)?.uploadDocuments as TypeOfDocumentYourNameSection[];
  const newDocs =  newDocumentsReferred.map((newDoc) => {
    const mediationUploadDocumentsCCD = new MediationUploadDocumentsCCD();
    mediationUploadDocumentsCCD.id = uuidv4();
    mediationUploadDocumentsCCD.value = new MediationMediationNonAttendanceDocs(mapperMediationDocumentToCCDDocuments(newDoc.caseDocument, 'DefendantOneMediationDocs'), newDoc.yourName, newDoc.dateInputFields.date, new Date());
    return mediationUploadDocumentsCCD;
  });
  return mediationUploadDocuments.concat(newDocs);
};

export const saveMediationUploadedDocuments = async (claimId: string,uploadDocuments: UploadDocuments,  req: AppRequest): Promise<Claim> => {
  const updatedCcdClaim = {} as CCDClaim;
  const oldClaim = await civilServiceClient.retrieveClaimDetails(claimId, req);

  const oldRes1MediationDocumentsReferred = oldClaim?.res1MediationDocumentsReferred || [];
  const oldRes1MediationNonAttendanceDocs = oldClaim?.res1MediationNonAttendanceDocs || [];
  const hasYourStatement = uploadDocuments.typeOfDocuments.find((doc) => doc.type === TypeOfMediationDocuments.YOUR_STATEMENT);
  const hasDocumentsReferred = uploadDocuments.typeOfDocuments.find((doc) => doc.type === TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT);

  if(hasYourStatement){
    updatedCcdClaim.res1MediationNonAttendanceDocs = getMediationNonAttendanceDocuments(uploadDocuments, oldRes1MediationNonAttendanceDocs);
  } else if (hasDocumentsReferred){
    updatedCcdClaim.res1MediationDocumentsReferred = getMediationDocumentsReferredDocuments(uploadDocuments, oldRes1MediationDocumentsReferred);
  }

  return await civilServiceClient.submitEvent(CaseEvent.CUI_UPLOAD_MEDIATION_DOCUMENTS, claimId, updatedCcdClaim, req);
};

