import {AppRequest} from 'models/AppRequest';
import {TypeOfMediationDocuments, UploadDocuments} from 'models/mediation/uploadDocuments/uploadDocuments';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {CaseEvent} from 'models/events/caseEvent';
import {CCDClaim} from 'models/civilClaimResponse';
import {TypeOfDocumentYourNameSection} from 'form/models/mediation/uploadDocuments/uploadDocumentsForm';
import {Claim} from 'models/claim';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

export const saveMediationUploadedDocuments = async (claimId: string,uploadDocuments: UploadDocuments,  req: AppRequest): Promise<Claim> => {
  const updatedCcdClaim = {} as CCDClaim;
  const oldClaim = await civilServiceClient.retrieveClaimDetails(claimId, req);

  const oldExistingTypeOfDocumentYourNameSection: TypeOfDocumentYourNameSection[] = oldClaim.mediationUploadDocuments.typeOfDocuments.find((typeOfDocument) => typeOfDocument.type === TypeOfMediationDocuments.YOUR_STATEMENT).uploadDocuments as TypeOfDocumentYourNameSection[];

  const existingTypeOfDocumentYourNameSection: TypeOfDocumentYourNameSection[] =  uploadDocuments.typeOfDocuments.find((typeOfDocument) => typeOfDocument.type === TypeOfMediationDocuments.YOUR_STATEMENT).uploadDocuments as TypeOfDocumentYourNameSection[];
  updatedCcdClaim.res1MediationNonAttendanceDocs = oldExistingTypeOfDocumentYourNameSection.concat(existingTypeOfDocumentYourNameSection);

  return await civilServiceClient.submitEvent(CaseEvent.EVIDENCE_UPLOAD_RESPONDENT, claimId, updatedCcdClaim, req);
};

