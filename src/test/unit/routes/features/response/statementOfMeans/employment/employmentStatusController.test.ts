import {app} from '../../../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {
  CITIZEN_EMPLOYMENT_URL,
  CITIZEN_SELF_EMPLOYED_URL,
  CITIZEN_UNEMPLOYED_URL,
  CITIZEN_WHO_EMPLOYS_YOU_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import fullAdmitPayBySetDateMock from '../../../../../../utils/mocks/fullAdmitPayBySetDateMock.json';
import {Claim} from 'models/claim';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('Employment status', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on Get', () => {
    it('should return employment status page successfully', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), fullAdmitPayBySetDateMock.case_data);
      });
      await request(app).get(CITIZEN_EMPLOYMENT_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.DO_YOU_HAVE_JOB);
        });
    });
    it('should return http 500 when has error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(CITIZEN_EMPLOYMENT_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
  describe('on Post', () => {

    beforeEach(() => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), fullAdmitPayBySetDateMock.case_data);
      });
    });

    it('should return error message when no option is selected', async () => {
      await request(app).post(CITIZEN_EMPLOYMENT_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_YES_NO_OPTION'));
          expect(res.text).toContain(TestMessages.GOVUK_ERROR_MESSAGE);
        });
    });
    it('should return error message when option yes is selected but no employment type is selected', async () => {
      await request(app).post(CITIZEN_EMPLOYMENT_URL)
        .send('option=yes')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_AT_LEAST_ONE_OPTION'));
        });
    });
    it('should redirect to employers page when option is yes and employment type is self-employed', async () => {
      await request(app).post(CITIZEN_EMPLOYMENT_URL)
        .send({option: 'yes', employmentCategory: 'SELF-EMPLOYED'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_SELF_EMPLOYED_URL);
        });
    });
    it('should redirect to employers page when option is yes and employment type is employed', async () => {
      await request(app).post(CITIZEN_EMPLOYMENT_URL)
        .send({option: 'yes', employmentCategory: 'EMPLOYED'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_WHO_EMPLOYS_YOU_URL);
        });
    });
    it('should redirect to employers page when option is yes and employment type is self-employed and employed', async () => {
      await request(app).post(CITIZEN_EMPLOYMENT_URL)
        .send({option: 'yes', employmentCategory: ['EMPLOYED', 'SELF-EMPLOYED']})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_WHO_EMPLOYS_YOU_URL);
        });
    });
    it('should redirect to unemployed page when option is no', async () => {
      await request(app).post(CITIZEN_EMPLOYMENT_URL)
        .send('option=no')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_UNEMPLOYED_URL);
        });
    });
    it('should return http 500 when has error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(CITIZEN_EMPLOYMENT_URL)
        .send('option=no')
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
