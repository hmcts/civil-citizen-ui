import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../../main/app';
import {CITIZEN_FULL_REJECTION_YOU_PAID_LESS_URL, RESPONSE_TASK_LIST_URL} from '../../../../../../../main/routes/urls';
import {mockCivilClaim, mockRedisFailure} from '../../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../../../main/modules/oidc');

describe('You Have Paid Less Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
    app.locals.draftStoreClient = mockCivilClaim;
  });

  describe('on GET', () => {
    it('should return you have paid less page successfully', async () => {
      await request(app).get(CITIZEN_FULL_REJECTION_YOU_PAID_LESS_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('You&#39;ve paid less than the total claim amount');
      });
    });

    it('should return status 500 when there is an error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CITIZEN_FULL_REJECTION_YOU_PAID_LESS_URL).expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should redirect to claim task list', async () => {
      await request(app)
        .post(CITIZEN_FULL_REJECTION_YOU_PAID_LESS_URL)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });
  });
});
