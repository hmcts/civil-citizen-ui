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
import {getNextYearValue} from '../../../../utils/dateUtils';

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
  const mockFutureYear = getNextYearValue();
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
        expect(res.text).toContain('You must enter type of document');
        expect(res.text).toContain(TestMessages.VALID_ENTER_DATE_DOC_ISSUED);
      });
  });

  it('should display documentForDisclosure validation error when Day month and year is invalid', async () => {
    const documentForDisclosureModel = {'documentsForDisclosure':[{'typeOfDocument':'', 'date-day':'45','date-month':'17','date-year':'202','file_upload':''}]};

    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .send(documentForDisclosureModel)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('You must enter type of document');
        expect(res.text).toContain(TestMessages.VALID_REAL_DATE);
      });
  });

  it('should display documentForDisclosure validation error when day is blank', async () => {
    const documentForDisclosureModel = {'documentsForDisclosure':[{'typeOfDocument':'', 'date-day':'','date-month':'11','date-year':'2022','file_upload':''}]};

    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .send(documentForDisclosureModel)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('You must enter type of document');
        expect(res.text).toContain(TestMessages.VALID_DATE_OF_DOC_MUST_INCLUDE_DAY);
      });
  });

  it('should display documentForDisclosure validation error when month is blank', async () => {
    const documentForDisclosureModel = {'documentsForDisclosure':[{'typeOfDocument':'', 'date-day':'12','date-month':'','date-year':'2022','file_upload':''}]};

    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .send(documentForDisclosureModel)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('You must enter type of document');
        expect(res.text).toContain(TestMessages.VALID_DATE_OF_DOC_MUST_INCLUDE_MONTH);
      });
  });

  it('should display documentForDisclosure validation error when year is blank', async () => {
    const documentForDisclosureModel = {'documentsForDisclosure':[{'typeOfDocument':'', 'date-day':'12','date-month':'11','date-year':'','file_upload':''}]};

    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .send(documentForDisclosureModel)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('You must enter type of document');
        expect(res.text).toContain(TestMessages.VALID_DATE_OF_DOC_MUST_INCLUDE_YEAR);
      });
  });

  it('should display documentForDisclosure validation error when date is in future', async () => {
    const documentForDisclosureModel = {'documentsForDisclosure':[{'typeOfDocument':'', 'date-day':'12','date-month':'11','date-year':mockFutureYear,'file_upload':''}]};

    await request(app)
      .post(CP_UPLOAD_DOCUMENTS_URL)
      .send(documentForDisclosureModel)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('You must enter type of document');
        expect(res.text).toContain(TestMessages.VALID_DATE_NOT_FUTURE);
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
