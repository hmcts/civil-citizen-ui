import request from 'supertest';
import {app} from '../../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import { DEBTS_URL} from '../../../../../../../main/routes/urls';
import * as draftStoreService from '../../../../../../../main/modules/draft-store/draftStoreService';

import {buildDebtFormYes} from '../../../../../../utils/mockForm';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;


describe('Debts', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });
  describe('on Exception', () => {
    test('should return http 500 when has error in the get method', async () => {
      const redisFailureError = 'Redis DraftStore failure.';
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(redisFailureError);
      });
      await request(app)
        .get(DEBTS_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toEqual({error: redisFailureError});
        });
    });
  });

  test('should return http 500 when has error in the post method', async () => {
    const redisFailureError = 'Redis DraftStore failure.';
    mockGetCaseData.mockImplementation(async () => {
      throw new Error(redisFailureError);
    });
    await request(app)
      .post(DEBTS_URL)
      .send(JSON.stringify(buildDebtFormYes))
      .expect((res) => {
        expect(res.status).toBe(500);
        expect(res.body).toEqual({error: redisFailureError});
      });
  });
  describe('on GET', () => {
/*    test('should return empty citizen response type page', async () => {
      mockGetCaseData.mockImplementation(async () => undefined);
      await request(app)
        .get(CITIZEN_RESPONSE_TYPE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('How do you respond to the claim?');
        });
    });*/

  });

  describe('on POST', () => {


/*    test('should redirect page when correct input when has information on redis', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        const respondent1 = new Respondent();
        respondent1.responseType = 'test';
        claim.respondent1 = respondent1;
        return claim;
      });
      await request(app)
        .post(CITIZEN_RESPONSE_TYPE_URL)
        .send('responseType=test')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });*/

  });
});
