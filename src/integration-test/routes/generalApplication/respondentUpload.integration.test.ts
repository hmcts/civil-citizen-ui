import express, {NextFunction, Request, Response} from 'express';
import request from 'supertest';
import controller from 'routes/features/generalApplication/response/respondentUploadEvidenceDocmentsController';
import {GA_RESPONDENT_UPLOAD_DOCUMENT_URL} from 'routes/urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {generateRedisKeyForGA} from 'modules/draft-store/draftStoreService';
import {GaResponse} from 'models/generalApplication/response/gaResponse';
import {CaseDocument} from 'models/document/caseDocument';
import {
  getDraftGARespondentResponse,
  saveDraftGARespondentResponse,
} from 'services/features/generalApplication/response/generalApplicationResponseStoreService';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('modules/utilityService', () => ({getClaimById: jest.fn()}));
jest.mock('services/features/generalApplication/response/generalApplicationResponseStoreService');

describe('respondent GA multipart upload', () => {
  const url = GA_RESPONDENT_UPLOAD_DOCUMENT_URL.replace(':id', '123').replace(':appId', '345');
  const key = 'respondent-123-345';
  const bytes = Buffer.from('%PDF-1.4\nSynthetic test file\n%%EOF');
  const document = {
    documentName: 'evidence.pdf',
    documentLink: {document_url: '/documents/1', document_filename: 'evidence.pdf'},
  } as CaseDocument;
  let draft: GaResponse;
  let app: express.Express;
  let errors: unknown[];

  beforeEach(() => {
    jest.resetAllMocks();
    draft = new GaResponse();
    errors = [];
    jest.mocked(generateRedisKeyForGA).mockReturnValue(key);
    jest.mocked(getDraftGARespondentResponse).mockResolvedValue(draft);
    jest.mocked(saveDraftGARespondentResponse).mockResolvedValue(undefined);
    app = express();
    app.use((req, _res, next) => {
      req.cookies = {lang: 'en'};
      req.session = {save: (callback: () => void) => callback()} as Request['session'];
      next();
    });
    app.use(controller);
    app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
      errors.push(error);
      res.sendStatus(500);
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('passes the actual multipart file to the client once and saves it to the response draft', async () => {
    const upload = jest.spyOn(CivilServiceClient.prototype, 'uploadDocument').mockResolvedValue(document);

    await request(app).post(url).field('action', 'uploadButton')
      .attach('selectedFile', bytes, {filename: 'evidence.pdf', contentType: 'application/pdf'})
      .expect(302).expect('Location', url);

    expect(upload).toHaveBeenCalledTimes(1);
    expect(upload).toHaveBeenCalledWith(expect.objectContaining({params: {id: '123', appId: '345'}}), expect.objectContaining({
      originalname: 'evidence.pdf', mimetype: 'application/pdf', buffer: bytes,
    }));
    expect(getDraftGARespondentResponse).toHaveBeenCalledWith(key);
    expect(saveDraftGARespondentResponse).toHaveBeenLastCalledWith(key, draft);
    expect(draft.uploadEvidenceDocuments.map(item => item.caseDocument)).toEqual([document]);
    expect(errors).toEqual([]);
  });

  it('forwards a client upload failure without saving a document', async () => {
    const error = new Error('upload unavailable');
    const upload = jest.spyOn(CivilServiceClient.prototype, 'uploadDocument').mockRejectedValue(error);

    await request(app).post(url).field('action', 'uploadButton')
      .attach('selectedFile', bytes, {filename: 'evidence.pdf', contentType: 'application/pdf'})
      .expect(500);

    expect(upload).toHaveBeenCalledTimes(1);
    expect(errors).toEqual([error]);
    expect(saveDraftGARespondentResponse).not.toHaveBeenCalled();
    expect(draft.uploadEvidenceDocuments).toEqual([]);
  });
});
