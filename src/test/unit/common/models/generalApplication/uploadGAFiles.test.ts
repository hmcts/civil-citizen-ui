import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {UploadAdditionalDocument} from 'models/generalApplication/UploadAdditionalDocument';
import {GenericForm} from 'common/form/models/genericForm';
import {FileUpload} from 'models/caseProgression/uploadDocumentsUserForm';
import {CaseDocument} from 'models/document/caseDocument';

describe('UploadGAFiles and UploadAdditionalDocument', () => {
  it('should construct UploadGAFiles with optional file', () => {
    const file = new FileUpload();
    file.originalname = 'evidence.pdf';
    const model = new UploadGAFiles(file);
    expect(model.fileUpload.originalname).toBe('evidence.pdf');
  });

  it('should require fileUpload when caseDocument is absent', async () => {
    const form = new GenericForm(new UploadGAFiles());
    await form.validate();
    expect(form.errorFor('fileUpload')).toBe('ERRORS.GENERAL_APPLICATION.UPLOAD_FILE_MESSAGE_V2');
  });

  it('should require fileUpload when caseDocument is null', async () => {
    const model = new UploadGAFiles();
    model.caseDocument = null as unknown as CaseDocument;
    const form = new GenericForm(model);
    await form.validate();
    expect(form.errorFor('fileUpload')).toBe('ERRORS.GENERAL_APPLICATION.UPLOAD_FILE_MESSAGE_V2');
  });

  it('should require fileUpload when caseDocument is empty string', async () => {
    const model = new UploadGAFiles();
    model.caseDocument = '' as unknown as CaseDocument;
    const form = new GenericForm(model);
    await form.validate();
    expect(form.errorFor('fileUpload')).toBe('ERRORS.GENERAL_APPLICATION.UPLOAD_FILE_MESSAGE_V2');
  });

  it('should skip fileUpload validation when caseDocument is present', async () => {
    const model = new UploadGAFiles();
    model.caseDocument = {documentName: 'existing.pdf'} as CaseDocument;
    const form = new GenericForm(model);
    await form.validate();
    expect(form.errorFor('fileUpload')).toBeUndefined();
  });

  it('should require typeOfDocument and file on UploadAdditionalDocument', async () => {
    const form = new GenericForm(new UploadAdditionalDocument());
    await form.validate();
    expect(form.errorFor('typeOfDocument')).toBe('ERRORS.GENERAL_APPLICATION.TYPE_OF_DOC');
    expect(form.errorFor('fileUpload')).toBe('ERRORS.GENERAL_APPLICATION.UPLOAD_FILE_MESSAGE_V2');
  });

  it('should accept UploadAdditionalDocument with type and caseDocument', async () => {
    const model = new UploadAdditionalDocument();
    model.typeOfDocument = 'Letter';
    model.caseDocument = {documentName: 'letter.pdf'} as CaseDocument;
    const form = new GenericForm(model);
    await form.validate();
    expect(form.hasErrors()).toBeFalsy();
  });

  it('should construct UploadAdditionalDocument with fileUpload', () => {
    const file = new FileUpload();
    file.originalname = 'extra.pdf';
    const model = new UploadAdditionalDocument(file);
    expect(model.fileUpload.originalname).toBe('extra.pdf');
  });
});
