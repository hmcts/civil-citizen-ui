import config from 'config';
import {AppRequest} from 'models/AppRequest';
import {CivilServiceClient} from 'client/civilServiceClient';
import {GenericForm} from 'form/models/genericForm';
import {FormValidationError} from 'form/validationErrors/formValidationError';
import {FileUpload} from 'models/caseProgression/uploadDocumentsUserForm';
import {CaseDocument} from 'models/document/caseDocument';
import {TypeOfDocumentSectionMapper} from 'services/features/caseProgression/TypeOfDocumentSectionMapper';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl, true);

interface UploadedDocument {
  fileUpload?: FileUpload;
  caseDocument?: CaseDocument;
}

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
  const filesToValidate = selectedFiles.length ? selectedFiles : [undefined];
  let firstValidationErrors: FormValidationError[] = [];

  for (const fileUpload of filesToValidate) {
    const document = createDocument();
    const validationErrors = validationErrorsFor(document, fileUpload);
    if (validationErrors.length) {
      firstValidationErrors = firstValidationErrors.length ? firstValidationErrors : validationErrors;
      continue;
    }
    document.caseDocument = await civilServiceClient.uploadDocument(req, fileUpload);
    await saveDocument(document);
  }
  return firstValidationErrors;
};
