import config from 'config';
import {AppRequest} from 'models/AppRequest';
import {CivilServiceClient} from 'client/civilServiceClient';
import {deleteRemovedDocuments} from 'common/utils/fileUploadUtils';
import {SummaryRow} from 'models/summaryList/summaryList';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl, true);

const DELETE_FILE_ACTION = /^deleteFile\[(\d+)]\[([^\]]+)]$/;

export interface DeleteFileTarget {
  index: number;
  documentId: string;
}

type UploadedDocument = {caseDocument?: {documentLink?: {document_url?: string}}};

export const getDeleteFileTarget = (action: unknown): DeleteFileTarget | undefined => {
  const match = typeof action === 'string' ? DELETE_FILE_ACTION.exec(action) : null;
  return match ? {index: Number(match[1]), documentId: match[2]} : undefined;
};

export const documentIdOf = (uploadedDocument: UploadedDocument | undefined): string | undefined => {
  const url = uploadedDocument?.caseDocument?.documentLink?.document_url;
  return url ? url.substring(url.lastIndexOf('/') + 1) : undefined;
};

export const isDeleteFileTargetFor = (uploadedDocument: UploadedDocument | undefined, target: DeleteFileTarget): boolean =>
  documentIdOf(uploadedDocument) !== undefined && documentIdOf(uploadedDocument) === target.documentId;

export const withDocumentId = (row: SummaryRow, uploadedDocument: UploadedDocument): SummaryRow =>
  ({...row, documentId: documentIdOf(uploadedDocument)});

export const deleteRemovedGADocuments = (req: AppRequest, removedDocuments: unknown, remainingDocuments: unknown, loggerName: string): Promise<void> =>
  deleteRemovedDocuments(req, removedDocuments, remainingDocuments, civilServiceClient, loggerName);
