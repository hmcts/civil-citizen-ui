import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {CLAIM_INTEREST_END_DATE_URL, CLAIM_INTEREST_START_DATE_URL} from 'routes/urls';
import {
  civilClaimResponseMock,
} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import noStatementOfMeansMock from '../../../../../utils/mocks/noStatementOfMeansMock.json';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('interest start date', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  app.request.cookies = {eligibilityCompleted: true};
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return interest start date page empty when dont have information on redis ', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), noStatementOfMeansMock.case_data);
      });
      await request(app)
        .get(CLAIM_INTEREST_START_DATE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.INTEREST_START_DATE);
        });
    });
    it('should return http 500 when has error in the get method', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(CLAIM_INTEREST_START_DATE_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should create a new claim if redis gives undefined', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), undefined);
      });
      await request(app)
        .post(CLAIM_INTEREST_START_DATE_URL)
        .send('year=2000')
        .send('month=1')
        .send('day=1')
        .send('reason=test')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    it('should return errors on no input', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      await request(app)
        .post(CLAIM_INTEREST_START_DATE_URL)
        .send('year=')
        .send('month=')
        .send('day=')
        .send('reason=')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_DAY'));
          expect(res.text).toContain(t('ERRORS.VALID_MONTH'));
          expect(res.text).toContain(t('ERRORS.VALID_FOUR_DIGIT_YEAR'));
          expect(res.text).toContain(t('ERRORS.VALID_WHY_FROM_PARTICULAR_DATE'));
        });
    });
    it('should return error on year less than 1872', async () => {
      await request(app)
        .post(CLAIM_INTEREST_START_DATE_URL)
        .send('year=1871')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_YEAR'));
        });
    });
    it('should return error on empty year', async () => {
      await request(app)
        .post(CLAIM_INTEREST_START_DATE_URL)
        .send('year=')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_FOUR_DIGIT_YEAR'));
        });
    });
    it('should return error on future date', async () => {
      await request(app)
        .post(CLAIM_INTEREST_START_DATE_URL)
        .send('year=2400')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.CORRECT_DATE_NOT_IN_FUTURE'));
        });
    });
    it('should return error 4 digit year', async () => {
      await request(app)
        .post(CLAIM_INTEREST_START_DATE_URL)
        .send('year=22')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_FOUR_DIGIT_YEAR'));
        });
    });
    it('should accept a valid input', async () => {
      await request(app)
        .post(CLAIM_INTEREST_START_DATE_URL)
        .send('year=2000')
        .send('month=1')
        .send('day=1')
        .send('reason=test')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    it('should redirect to interest end date page', async () => {
      await request(app)
        .post(CLAIM_INTEREST_START_DATE_URL)
        .send('year=2021')
        .send('month=1')
        .send('day=1')
        .send('reason=test')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(`Redirecting to ${CLAIM_INTEREST_END_DATE_URL}`);
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(CLAIM_INTEREST_START_DATE_URL)
        .send('year=1981')
        .send('month=1')
        .send('day=1')
        .send('reason=test')
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
