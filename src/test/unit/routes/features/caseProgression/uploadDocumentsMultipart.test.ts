import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {app} from '../../../../../main/app';
import {CP_UPLOAD_DOCUMENTS_URL} from 'routes/urls';
import {Claim} from 'models/claim';
import {UploadDocumentsUserForm} from 'models/caseProgression/uploadDocumentsUserForm';
import {getClaimById} from 'modules/utilityService';
import {getUploadDocumentsForm, saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';
import * as DisclosureService from 'services/features/caseProgression/disclosureService';
import * as WitnessService from 'services/features/caseProgression/witnessService';
import {getExpertContent} from 'services/features/caseProgression/expertService';
import {getTrialContent} from 'services/features/caseProgression/trialService';
import civilClaimResponseMock from '../../../../utils/mocks/civilClaimResponseMock.json';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('services/features/caseProgression/disclosureService');
jest.mock('services/features/caseProgression/witnessService');
jest.mock('services/features/caseProgression/expertService');
jest.mock('services/features/caseProgression/trialService');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));
jest.mock('services/features/caseProgression/caseProgressionService', () => ({
  saveCaseProgression: jest.fn(),
  getUploadDocumentsForm: jest.fn(),
  addAnother: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));

const tooManyFilesMessage = 'You can only upload up to 10 documents at a time';
const wrongFileTypeMessage = 'Document must be Word, Excel, PowerPoint, PDF';
const pdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n');

describe('Upload documents controller - multipart uploads', () => {
  beforeAll(() => {
    nock(config.get<string>('idamUrl'))
      .post('/o/token')
      .reply(200, {id_token: config.get<string>('citizenRoleToken')});
    (DisclosureService.getDisclosureContent as jest.Mock).mockReturnValue([]);
    (WitnessService.getWitnessContent as jest.Mock).mockReturnValue([]);
    (getExpertContent as jest.Mock).mockReturnValue([]);
    (getTrialContent as jest.Mock).mockReturnValue([]);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (getClaimById as jest.Mock).mockResolvedValue(Object.assign(new Claim(), civilClaimResponseMock.case_data));
    (getUploadDocumentsForm as jest.Mock).mockReturnValue(new UploadDocumentsUserForm());
    (saveCaseProgression as jest.Mock).mockResolvedValue(true);
  });

  it('should show the wrong file type error when a spoofed file is sent without its upload action', async () => {
    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .field('action', 'add_another-witnessStatement')
      .attach('expertReport[0][fileUpload]', Buffer.from('This is not a real PDF.\n'), {
        filename: 'spoofed.pdf',
        contentType: 'application/pdf',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(wrongFileTypeMessage);
      });
    expect(saveCaseProgression).not.toHaveBeenCalled();
  });

  it('should not reject an upload because of files chosen in other sections', async () => {
    nock(config.get<string>('services.civilService.url'))
      .post('/case/document/generateAnyDoc')
      .reply(200, {documentLink: {document_url: 'http://dm/documents/doc-1', document_binary_url: '', document_filename: 'witness.pdf'}, documentName: 'witness.pdf'});
    const req = request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .field('action', 'witnessStatement[0][uploadButton]')
      .attach('witnessStatement[0][fileUpload]', pdfBuffer, {filename: 'witness.pdf', contentType: 'application/pdf'});
    for (let index = 0; index < 11; index++) {
      req.attach('documentsReferred[0][fileUpload]', pdfBuffer, {filename: `referred-${index}.pdf`, contentType: 'application/pdf'});
    }

    await req.expect((res) => {
      expect(res.status).toBe(200);
      expect(res.text).not.toContain(tooManyFilesMessage);
    });
  });

  it('should reject an upload when the section on the button has more than 10 files', async () => {
    const req = request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .field('action', 'witnessStatement[0][uploadButton]');
    for (let index = 0; index < 11; index++) {
      req.attach('witnessStatement[0][fileUpload]', pdfBuffer, {filename: `witness-${index}.pdf`, contentType: 'application/pdf'});
    }

    await req.expect((res) => {
      expect(res.status).toBe(200);
      expect(res.text).toContain(tooManyFilesMessage);
    });
  });
});
