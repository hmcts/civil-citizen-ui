import request from 'supertest';
import {
  mockCivilClaim,
  mockRedisFailure,
} from '../../../../utils/mockDraftStore';
import {CP_UPLOAD_DOCUMENTS_URL} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {app} from '../../../../../main/app';
import config from 'config';
import nock from 'nock';
import {getDisclosureContent} from 'services/features/caseProgression/disclosureService';
import {getWitnessContent} from 'services/features/caseProgression/witnessService';
import {getExpertContent} from 'services/features/caseProgression/expertService';

const getDisclosureContentMock = getDisclosureContent as jest.Mock;
const getWitnessContentMock = getWitnessContent as jest.Mock;
const getExpertContentMock = getExpertContent as jest.Mock;
import {t} from 'i18next';
import {getTrialContent} from 'services/features/caseProgression/trialService';

const getTrialContentMock = getTrialContent as jest.Mock;

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('services/features/caseProgression/disclosureService');
jest.mock('services/features/caseProgression/witnessService');
jest.mock('services/features/caseProgression/expertService');
jest.mock('services/features/caseProgression/trialService');

describe('Upload document- upload document controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    getDisclosureContentMock.mockReturnValue([]);
    getWitnessContentMock.mockReturnValue([]);
    getExpertContentMock.mockReturnValue([]);
    getTrialContentMock.mockReturnValue([]);
  });

  it('should render page successfully if cookie has correct values', async () => {
    app.locals.draftStoreClient = mockCivilClaim;
    await request(app).get(CP_UPLOAD_DOCUMENTS_URL).expect((res) => {
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('PAGES.UPLOAD_DOCUMENTS.TITLE'));
    });
  });

  it('should return 500 error page for redis failure', async () => {
    app.locals.draftStoreClient = mockRedisFailure;
    await request(app)
      .get(CP_UPLOAD_DOCUMENTS_URL)
      .expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
  });
});

describe('on POST', () => {
  beforeEach(() => {
    app.locals.draftStoreClient = mockCivilClaim;
  });
  it('should display documentForDisclosure validation error when invalid', async () => {
    const documentForDisclosureModel = {'documentsForDisclosure':[{'typeOfDocument':'', 'date-day':'','date-month':'','date-year':'','file_upload':''}]};

    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .send(documentForDisclosureModel)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_ENTER_TYPE_OF_DOCUMENT);
      });
  });

  it('should display disclosureList validation error when invalid', async () => {
    const disclosureList = {'disclosureList':[{'file_upload':''}]};

    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .send(disclosureList)
      .expect((res) => {
        expect(res.status).toBe(200);
      });
  });

  it('should display witness validation error when invalid', async () => {
    const model = {'witnessStatement':[{'witnessName':'', 'date-day':'','date-month':'','date-year':'','file_upload':''}]};

    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .send(model)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_ENTER_WITNESS_NAME);
      });
  });

  it('should display all expert validation errors', async () => {
    const model = {'expertReport':[{'expertName':'', 'multipleExpertsName':'', 'fieldOfExpertise':'', 'questionDocumentName':'', 'otherPartyQuestionsDocumentName':''}]};

    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .send(model)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_ENTER_EXPERT_NAME);
        expect(res.text).toContain(TestMessages.VALID_ENTER_EXPERT_NAMES);
        expect(res.text).toContain(TestMessages.VALID_ENTER_EXPERTISE);
        expect(res.text).toContain(TestMessages.VALID_ENTER_DOCUMENT_QUESTIONS);
        expect(res.text).toContain(TestMessages.VALID_ENTER_DOCUMENT_QUESTIONS_OTHER_PARTY);
      });
  });

  it('should not error, nothing to validate', async () => {
    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .send({})
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Upload');
      });
  });

  it('should return 500 error page for failure', async () => {
    app.locals.draftStoreClient = mockRedisFailure;
    await request(app)
      .get(CP_UPLOAD_DOCUMENTS_URL)
      .expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
  });
});
