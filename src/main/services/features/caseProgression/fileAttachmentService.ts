import {CaseProgression} from 'models/caseProgression/caseProgression';
import {ClaimantOrDefendant} from 'models/partyType';
import {Document} from 'models/document/document';
import {UploadDocuments, UploadDocumentTypes} from 'models/caseProgression/uploadDocumentsType';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';
import {Request} from 'express';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

function getDocument(uploadDocumentTypes: UploadDocumentTypes): Document {
  return Object.values(uploadDocumentTypes).find(value => value instanceof Document);
}

function getDocuments(uploadDocuments: UploadDocuments): Document[] {
  const documents: Document[] = [];
  uploadDocuments.expert.forEach(elem => documents.push(getDocument(elem)));
  uploadDocuments.disclosure.forEach(elem => documents.push(getDocument(elem)));
  uploadDocuments.trial.forEach(elem => documents.push(getDocument(elem)));
  uploadDocuments.witness.forEach(elem => documents.push(getDocument(elem)));
  return documents;
}

export const attachCaseDocuments = async (claimId: string, claimantOrDefendant: ClaimantOrDefendant, caseProgression: CaseProgression, req: Request): Promise<CaseProgression> => {
  let documentsToAttach: Document[];
  if (claimantOrDefendant===ClaimantOrDefendant.DEFENDANT) {
    documentsToAttach = getDocuments(caseProgression.defendantUploadDocuments);
  } else {
    documentsToAttach = getDocuments(caseProgression.claimantUploadDocuments);
  }
  const attachedDocuments = await civilServiceClient.attachCaseDocuments(claimId, documentsToAttach, <AppRequest>req)

  if (documentsToAttach.length === attachedDocuments.length) {
    return caseProgression;
  }

  return null;
};
