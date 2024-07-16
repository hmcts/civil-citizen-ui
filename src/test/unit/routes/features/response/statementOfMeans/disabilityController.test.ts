import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  CITIZEN_DISABILITY_URL,
  CITIZEN_RESIDENCE_URL,
  CITIZEN_SEVERELY_DISABLED_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import fullAdmitPayBySetDateMock from '../../../../../utils/mocks/fullAdmitPayBySetDateMock.json';
import {Claim} from 'models/claim';
import civilClaimResponseOptionNoMock from '../../../../../utils/mocks/civilClaimResponseOptionNoMock.json';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('Disability', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return citizen disability page', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), fullAdmitPayBySetDateMock.case_data);
      });
      await request(app)
        .get(CITIZEN_DISABILITY_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ARE_YOU_DISABLED);
        });
    });
    it('should show disability page when haven´t statementOfMeans', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseOptionNoMock.case_data);
      });

      await request(app)
        .get(CITIZEN_DISABILITY_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });
    it('should return http 500 when has error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(CITIZEN_DISABILITY_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should redirect page when "no"', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), fullAdmitPayBySetDateMock.case_data);
      });
      await request(app)
        .post(CITIZEN_DISABILITY_URL)
        .send('option=no')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_RESIDENCE_URL);

        });
    });
    it('should return error on incorrect input', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), fullAdmitPayBySetDateMock.case_data);
      });
      await request(app)
        .post(CITIZEN_DISABILITY_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_YES_NO_OPTION);
        });
    });
    it('should redirect page when "no" and haven´t statementOfMeans', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseOptionNoMock.case_data);
      });
      await request(app)
        .post(CITIZEN_DISABILITY_URL)
        .send('option=no')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_RESIDENCE_URL);
        });
    });
    it('should redirect page when "yes"', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), fullAdmitPayBySetDateMock.case_data);
      });
      await request(app)
        .post(CITIZEN_DISABILITY_URL)
        .send('option=yes')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_SEVERELY_DISABLED_URL);
        });
    });
    it('should return http 500 when has error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(CITIZEN_DISABILITY_URL)
        .send('option=no')
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
