import {UploadN245GAFiles} from 'models/generalApplication/uploadN245GAFiles';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {FileUpload} from 'models/caseProgression/uploadDocumentsUserForm';
import {GenericForm} from 'common/form/models/genericForm';

describe('UploadN245GAFiles', () => {
  it('copies fileUpload and caseDocument from UploadGAFiles', () => {
    const fileUpload = new FileUpload();
    fileUpload.fieldname = 'selectedFile';
    fileUpload.originalname = 'n245.pdf';
    fileUpload.mimetype = 'application/pdf';
    fileUpload.buffer = Buffer.from('%PDF-1.4 synthetic test file');
    fileUpload.size = fileUpload.buffer.length;
    const caseDocument = {documentLink: {document_url: 'http://example'}} as UploadGAFiles['caseDocument'];
    const source = new UploadGAFiles(fileUpload);
    source.caseDocument = caseDocument;

    const model = new UploadN245GAFiles(source);

    expect(model.fileUpload).toBe(fileUpload);
    expect(model.caseDocument).toBe(caseDocument);
  });

  it('requires a file upload when caseDocument is missing', async () => {
    const source = new UploadGAFiles();
    const model = new UploadN245GAFiles(source);
    const form = new GenericForm(model);

    await form.validate();

    expect(form.errorFor('fileUpload')).toBe('ERRORS.GENERAL_APPLICATION.UPLOAD_ONE_FILE');
  });

  it('requires a file upload when caseDocument is null or empty string', async () => {
    const withNull = new UploadN245GAFiles(new UploadGAFiles());
    withNull.caseDocument = null as never;
    const nullForm = new GenericForm(withNull);
    await nullForm.validate();
    expect(nullForm.errorFor('fileUpload')).toBe('ERRORS.GENERAL_APPLICATION.UPLOAD_ONE_FILE');

    const withEmpty = new UploadN245GAFiles(new UploadGAFiles());
    withEmpty.caseDocument = '' as never;
    const emptyForm = new GenericForm(withEmpty);
    await emptyForm.validate();
    expect(emptyForm.errorFor('fileUpload')).toBe('ERRORS.GENERAL_APPLICATION.UPLOAD_ONE_FILE');
  });
});
