import config from 'config';
import {AppRequest} from 'models/AppRequest';
import {CivilServiceClient} from 'client/civilServiceClient';
import {GenericForm} from 'form/models/genericForm';
import {FormValidationError} from 'form/validationErrors/formValidationError';
import {FileUpload} from 'models/caseProgression/uploadDocumentsUserForm';
import {CaseDocument} from 'models/document/caseDocument';
import {TypeOfDocumentSectionMapper} from 'services/features/caseProgression/TypeOfDocumentSectionMapper';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClientForDocRetrieve: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl, true);

interface UploadedDocument {
  fileUpload?: FileUpload;
  caseDocument?: CaseDocument;
}

/**
 * Uploads every file chosen in one go on a general application upload page (several files can be selected or
 * dropped together). Each file is validated on its own: valid files are uploaded and passed to saveDocument, and
 * the first validation errors are returned so the page can show them. With no file chosen, the usual
 * "choose a file" errors are returned.
 */
export const uploadEachSelectedFile = async <T extends UploadedDocument>(
  req: AppRequest,
  createDocument: () => T,
  saveDocument: (document: T) => Promise<void>,
): Promise<FormValidationError[]> => {
  const fileUploads = TypeOfDocumentSectionMapper.mapToFiles(req);
  let errors: FormValidationError[] = [];
  for (const fileUpload of fileUploads.length ? fileUploads : [undefined]) {
    const document = createDocument();
    document.fileUpload = fileUpload;
    const form = new GenericForm(document);
    form.validateSync();
    delete document.fileUpload; // release file memory
    if (form.hasErrors()) {
      if (!errors.length) {
        errors = form.getAllErrors();
      }
      continue;
    }
    document.caseDocument = await civilServiceClientForDocRetrieve.uploadDocument(req, fileUpload);
    await saveDocument(document);
  }
  return errors;
};
