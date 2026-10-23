import config from 'config';
import {AppRequest} from 'models/AppRequest';
import {CivilServiceClient} from 'client/civilServiceClient';
import {deleteRemovedDocuments} from 'common/utils/fileUploadUtils';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl, true);

const DELETE_FILE_ACTION = /^deleteFile\[(\d+)]$/;

export const getDeleteFileIndex = (action: unknown): number | undefined => {
  const match = typeof action === 'string' ? DELETE_FILE_ACTION.exec(action) : null;
  return match ? Number(match[1]) : undefined;
};

export const deleteRemovedGADocuments = (req: AppRequest, removedDocuments: unknown, remainingDocuments: unknown, loggerName: string): Promise<void> =>
  deleteRemovedDocuments(req, removedDocuments, remainingDocuments, civilServiceClient, loggerName);
