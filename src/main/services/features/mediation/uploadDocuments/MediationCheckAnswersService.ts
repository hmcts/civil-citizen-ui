import {AppRequest} from 'models/AppRequest';
import {TypeOfMediationDocuments, UploadDocuments} from 'models/mediation/uploadDocuments/uploadDocuments';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {CaseEvent} from 'models/events/caseEvent';
import {CCDClaim} from 'models/civilClaimResponse';
import {TypeOfDocumentYourNameSection} from 'form/models/mediation/uploadDocuments/uploadDocumentsForm';
import {Claim} from 'models/claim';
import {TypeOfDocumentSection} from 'models/caseProgression/uploadDocumentsUserForm';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

export const saveMediationUploadedDocuments = async (claimId: string,uploadDocuments: UploadDocuments,  req: AppRequest): Promise<Claim> => {
  const updatedCcdClaim = {} as CCDClaim;
  const oldClaim = await civilServiceClient.retrieveClaimDetails(claimId, req);

  const oldRes1MediationDocumentsReferred: TypeOfDocumentSection[] = oldClaim.res1MediationDocumentsReferred || [];
  const newRes1MediationDocumentsReferred: TypeOfDocumentSection[] = uploadDocuments.typeOfDocuments.find((doc) => doc.type === TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT)?.uploadDocuments as TypeOfDocumentSection[];
  const oldRes1MediationNonAttendanceDocs: TypeOfDocumentYourNameSection[] = oldClaim.res1MediationNonAttendanceDocs || [];
  const newRes1MediationNonAttendanceDocs: TypeOfDocumentYourNameSection[] = uploadDocuments.typeOfDocuments.find((doc) => doc.type === TypeOfMediationDocuments.YOUR_STATEMENT)?.uploadDocuments as TypeOfDocumentYourNameSection[];
  //update the old claim with the new documents
  newRes1MediationDocumentsReferred.forEach((newDoc) => {
    oldRes1MediationDocumentsReferred.push(newDoc);
  });

  newRes1MediationNonAttendanceDocs.forEach((newDoc) => {
    oldRes1MediationNonAttendanceDocs.push(newDoc);
  });
  updatedCcdClaim.res1MediationNonAttendanceDocs = oldRes1MediationNonAttendanceDocs;
  updatedCcdClaim.res1MediationDocumentsReferred = oldRes1MediationDocumentsReferred;

  return await civilServiceClient.submitEvent(CaseEvent.CUI_UPLOAD_MEDIATION_DOCUMENTS, claimId, updatedCcdClaim, req);
};

