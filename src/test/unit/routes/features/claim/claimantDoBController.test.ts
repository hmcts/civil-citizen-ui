import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {CLAIMANT_DOB_URL, CLAIMANT_PHONE_NUMBER_URL} from 'routes/urls';
import {mockCivilClaim, mockDraftClaim, mockNoStatementOfMeans, mockRedisFailure} from '../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {
  addDaysToDate, 
  formatDateToFullDate, 
  getDOBforAgeFromCurrentTime,
} from 'common/utils/dateUtils';
import {Claim} from 'models/claim';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('Claimant Date of Birth Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  app.request.cookies = {eligibilityCompleted: true};

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('on GET', () => {
    it('should render date of birth page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app).get(CLAIMANT_DOB_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('What is your date of birth?');
      expect(res.text).not.toContain('NaN');
    });

    it('should render date of birth page with values', async () => {
      app.locals.draftStoreClient = mockNoStatementOfMeans;
      const res = await request(app).get(CLAIMANT_DOB_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('What is your date of birth?');
      expect(res.text).not.toContain('NaN');
    });

    it('should render saved date of birth values', async () => {
      app.locals.draftStoreClient = mockDraftClaim({
        case_data: {
          applicant1: {
            dateOfBirth: {
              date: new Date('1980-03-02T00:00:00.000Z'),
            },
          },
        },
      } as unknown as Claim);
      const res = await request(app).get(CLAIMANT_DOB_URL);
      const dom = new JSDOM(res.text);

      expect(res.status).toBe(200);
      expect(dom.window.document.getElementById('day').getAttribute('value')).toBe('2');
      expect(dom.window.document.getElementById('month').getAttribute('value')).toBe('3');
      expect(dom.window.document.getElementById('year').getAttribute('value')).toBe('1980');
    });

    it('should return http 500 when has error in the get method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CLAIMANT_DOB_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should render date of birth page if there are form errors', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app).post(CLAIMANT_DOB_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('What is your date of birth?');
    });

    it('should show validation error for claimant under 18', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const today = new Date();
      const maxDate = formatDateToFullDate(addDaysToDate(getDOBforAgeFromCurrentTime(18), 1), 'en');
      await request(app).post(CLAIMANT_DOB_URL)
        .send({ day:today.getDate(), month:today.getMonth(), year: today.getFullYear() - 16 })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_ENTER_A_DATE_BEFORE', { maxDate }));
        });
    });

    it('should redirect to the claimant phone number page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).post(CLAIMANT_DOB_URL)
        .send({day: 2, month: 3, year: 1980})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(CLAIMANT_PHONE_NUMBER_URL);
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CLAIMANT_DOB_URL)
        .send({day: 4, month: 5, year: 1952})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
