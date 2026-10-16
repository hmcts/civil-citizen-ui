import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';
import {CaseDocument} from 'models/document/caseDocument';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import {uploadEachSelectedFile} from 'services/features/generalApplication/documentUpload/uploadEachSelectedFile';

describe('uploadEachSelectedFile', () => {
  const multerFile = (originalname: string, mimetype: string, content: string) => ({
    fieldname: 'selectedFile',
    originalname,
    mimetype,
    size: content.length,
    buffer: Buffer.from(content),
  } as Express.Multer.File);
  const pdf = (name: string) => multerFile(name, 'application/pdf', `%PDF-1.4 ${name}`);
  const caseDocumentFor = (documentName: string) => ({documentName} as CaseDocument);

  let uploadDocument: jest.SpyInstance;
  let saved: UploadGAFiles[];
  const saveDocument = async (document: UploadGAFiles) => {
    saved.push(document);
  };

  beforeEach(() => {
    saved = [];
    uploadDocument = jest.spyOn(CivilServiceClient.prototype, 'uploadDocument')
      .mockImplementation(async (_req, fileUpload) => caseDocumentFor(fileUpload.originalname));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uploads and saves every chosen file', async () => {
    const req = {files: [pdf('first.pdf'), pdf('second.pdf')]} as unknown as AppRequest;

    const errors = await uploadEachSelectedFile(req, () => new UploadGAFiles(), saveDocument);

    expect(errors).toEqual([]);
    expect(uploadDocument).toHaveBeenCalledTimes(2);
    expect(saved.map((document) => document.caseDocument.documentName)).toEqual(['first.pdf', 'second.pdf']);
    expect(saved.every((document) => document.fileUpload === undefined)).toBe(true);
  });

  it('still uploads a single file from multer.single', async () => {
    const req = {file: pdf('only.pdf')} as unknown as AppRequest;

    const errors = await uploadEachSelectedFile(req, () => new UploadGAFiles(), saveDocument);

    expect(errors).toEqual([]);
    expect(saved.map((document) => document.caseDocument.documentName)).toEqual(['only.pdf']);
  });

  it('uploads the valid files and returns the error for an invalid one', async () => {
    const req = {files: [pdf('good.pdf'), multerFile('bad.exe', 'application/x-msdownload', 'MZ')]} as unknown as AppRequest;

    const errors = await uploadEachSelectedFile(req, () => new UploadGAFiles(), saveDocument);

    expect(saved.map((document) => document.caseDocument.documentName)).toEqual(['good.pdf']);
    expect(errors.length).toBeGreaterThan(0);
    expect(JSON.stringify(errors)).toContain('ERRORS.VALID_MIME_TYPE_FILE');
  });

  it('returns the choose a file error when no file is chosen', async () => {
    const req = {files: []} as unknown as AppRequest;

    const errors = await uploadEachSelectedFile(req, () => new UploadGAFiles(), saveDocument);

    expect(uploadDocument).not.toHaveBeenCalled();
    expect(saved).toEqual([]);
    expect(JSON.stringify(errors)).toContain('ERRORS.GENERAL_APPLICATION.UPLOAD_FILE_MESSAGE_V2');
  });
});
