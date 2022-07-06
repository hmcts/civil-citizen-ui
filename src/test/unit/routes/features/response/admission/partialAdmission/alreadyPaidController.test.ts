import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../../main/app';
import {VALID_YES_NO_SELECTION} from '../../../../../../../main/common/form/validationErrors/errorMessageConstants';
import {
  CITIZEN_ALREADY_PAID_URL,
  CLAIM_TASK_LIST_URL,
} from '../../../../../../../main/routes/urls';
import {mockCivilClaim, mockRedisFailure} from '../../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');

describe('Already Paid Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    beforeEach(() => {
      app.locals.draftStoreClient = mockCivilClaim;
    });

    it('should return already paid page successfully', async () => {
      await request(app).get(CITIZEN_ALREADY_PAID_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Have you paid the claimant the amount you admit you owe?');
      });
    });

    it('should return status 500 when there is an error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CITIZEN_ALREADY_PAID_URL).expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    beforeEach(() => {
      app.locals.draftStoreClient = mockCivilClaim;
    });

    it('should validate form', async () => {
      await request(app)
        .post(CITIZEN_ALREADY_PAID_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_YES_NO_SELECTION);
        });
    });

    it('should redirect to claim task list if selected option is no', async () => {
      await request(app)
        .post(CITIZEN_ALREADY_PAID_URL)
        .send({option: 'No'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIM_TASK_LIST_URL);
        });
    });

    it('should redirect to claim task list if selected option is yes', async () => {
      await request(app)
        .post(CITIZEN_ALREADY_PAID_URL)
        .send({option: 'Yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIM_TASK_LIST_URL);
        });
    });
  });
});
