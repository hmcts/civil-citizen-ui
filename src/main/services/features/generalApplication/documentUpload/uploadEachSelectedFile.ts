import config from 'config';
import {AppRequest} from 'models/AppRequest';
import {CivilServiceClient} from 'client/civilServiceClient';
import {GenericForm} from 'form/models/genericForm';
import {FormValidationError} from 'form/validationErrors/formValidationError';
import {FileUpload} from 'models/caseProgression/uploadDocumentsUserForm';
import {CaseDocument} from 'models/document/caseDocument';
import {TypeOfDocumentSectionMapper} from 'services/features/caseProgression/TypeOfDocumentSectionMapper';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('uploadEachSelectedFile');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl, true);

interface UploadedDocument {
  fileUpload?: FileUpload;
  caseDocument?: CaseDocument;
}

export const fileUploadFailedError = (): FormValidationError => new FormValidationError({
  property: 'fileUpload',
  constraints: {uploadError: 'ERRORS.FILE_UPLOAD_FAILED'},
  children: [],
});

export const uploadToDocumentManagement = async (req: AppRequest, fileUpload: FileUpload): Promise<CaseDocument | undefined> => {
  try {
    const caseDocument = await civilServiceClient.uploadDocument(req, fileUpload);
    if (!caseDocument?.documentLink) {
      logger.error('[SAVE FILE] File upload response missing documentLink');
      return undefined;
    }
    return caseDocument;
  } catch (uploadError) {
    logger.error(`[SAVE FILE] API upload failed: error=${uploadError?.message || uploadError}`);
    return undefined;
  }
};

const validationErrorsFor = (document: UploadedDocument, fileUpload: FileUpload | undefined): FormValidationError[] => {
  document.fileUpload = fileUpload;
  const form = new GenericForm(document);
  form.validateSync();
  delete document.fileUpload;
  return form.hasErrors() ? form.getAllErrors() : [];
};

export const uploadEachSelectedFile = async <T extends UploadedDocument>(
  req: AppRequest,
  createDocument: () => T,
  saveDocument: (document: T) => Promise<void>,
): Promise<FormValidationError[]> => {
  const selectedFiles = TypeOfDocumentSectionMapper.mapToFiles(req);
  if (!selectedFiles.length) {
    return validationErrorsFor(createDocument(), undefined);
  }

  let firstValidationErrors: FormValidationError[] = [];
  for (const fileUpload of selectedFiles) {
    const document = createDocument();
    const validationErrors = validationErrorsFor(document, fileUpload);
    if (validationErrors.length) {
      firstValidationErrors = firstValidationErrors.length ? firstValidationErrors : validationErrors;
      continue;
    }
    const caseDocument = await uploadToDocumentManagement(req, fileUpload);
    if (!caseDocument) {
      firstValidationErrors = firstValidationErrors.length ? firstValidationErrors : [fileUploadFailedError()];
      continue;
    }
    document.caseDocument = caseDocument;
    await saveDocument(document);
  }
  return firstValidationErrors;
};
