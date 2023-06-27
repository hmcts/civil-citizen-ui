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

class CaseDocumentsAttachmentResult {
  caseProgression: CaseProgression;
  errors: string[];

  constructor(caseProgression: CaseProgression, errors: string[]) {
    this.caseProgression = caseProgression;
    this.errors = errors;
  }
}

export function getDocument(uploadDocumentTypes: UploadDocumentTypes): Document {
  let document = null;
  for (const [outerKey, outerValue] of Object.entries(uploadDocumentTypes)) {
    if (outerKey === 'caseDocument') {
      for (const [innerKey, innerValue] of Object.entries(outerValue)) {
        if (innerKey.includes('Document') && innerValue !== undefined) {
          document = innerValue;
        }
      }
    }
  }
  return <Document>document;
}

export function getDocuments(uploadDocuments: UploadDocumentTypes[][]): Map<Document, UploadDocumentTypes> {
  const documents: Map<Document, UploadDocumentTypes> = new Map();
  for (const uploadDocumentTypes of uploadDocuments) {
    uploadDocumentTypes.forEach(elem => documents.set(getDocument(elem), elem));
  }
  return documents;
}

export function areEqual(document: Document, attachedDocument: Document): boolean {
  return document.document_filename === attachedDocument.document_filename
    && document.document_binary_url === attachedDocument.document_binary_url
    && document.document_url === attachedDocument.document_url
    && document.document_hash === attachedDocument.document_hash
    && document.category_id === attachedDocument.category_id;
}

export function isAttachedTo(document: Document, attachedDocuments: Document[]): boolean {
  for (const attachedDocument of attachedDocuments) {
    if (areEqual(document, attachedDocument)) {
      return true;
    }
  }
  return false;
}

export function remove(element: UploadDocumentTypes, collection: UploadDocumentTypes[]): boolean {
  const index = collection.indexOf(element);
  if (index > -1) {
    collection.splice(index, 1);
  }
  return index > -1;
}

export function removeFrom(elementToRemove: UploadDocumentTypes, uploadDocumentsToProcess: UploadDocumentTypes[][]) {
  for (const collection of uploadDocumentsToProcess) {
    const removed = remove(elementToRemove, collection);
    if (removed) {
      break;
    }
  }
}

export function getUploadDocumentsToProcess(uploadDocuments: UploadDocuments) {
  return [uploadDocuments.expert,
    uploadDocuments.disclosure,
    uploadDocuments.trial,
    uploadDocuments.witness,
  ].filter(elem => elem);
}

export const attachCaseDocuments = async (claimId: string, claimantOrDefendant: ClaimantOrDefendant, caseProgression: CaseProgression, req: Request): Promise<CaseDocumentsAttachmentResult> => {
  const uploadDocuments: UploadDocuments = claimantOrDefendant === ClaimantOrDefendant.DEFENDANT ? caseProgression.defendantUploadDocuments : caseProgression.claimantUploadDocuments;
  const uploadDocumentsToProcess: UploadDocumentTypes[][] = getUploadDocumentsToProcess(uploadDocuments);
  const documentsToAttach: Map<Document, UploadDocumentTypes> = getDocuments(uploadDocumentsToProcess);
  const attachedDocuments = await civilServiceClient.attachCaseDocuments(claimId, Array.from(documentsToAttach.keys()), <AppRequest>req);
  const errors: string[] = [];

  if (documentsToAttach.size !== attachedDocuments.length) {
    for (const document of documentsToAttach.keys()) {
      if (!isAttachedTo(document, attachedDocuments)) {
        errors.push(`${document.document_filename} has not been attached to the case ${claimId}.`);
        removeFrom(documentsToAttach.get(document), uploadDocumentsToProcess);
      }
    }
  }

  return new CaseDocumentsAttachmentResult(caseProgression, errors);
};
