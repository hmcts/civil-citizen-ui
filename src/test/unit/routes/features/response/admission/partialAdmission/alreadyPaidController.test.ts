import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../../main/app';
import {
  REDIS_ERROR_MESSAGE,
  VALID_YES_NO_SELECTION,
} from '../../../../../../../main/common/form/validationErrors/errorMessageConstants';
import {
  CITIZEN_ALREADY_PAID_URL,
  CLAIM_TASK_LIST_URL,
} from '../../../../../../../main/routes/urls';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');

const mockDraftStore = {
  get: jest.fn(() => Promise.resolve('{}')),
  set: jest.fn(() => Promise.resolve()),
};

const mockGetExceptionDraftStore = {
  get: jest.fn(() => {
    throw new Error(REDIS_ERROR_MESSAGE);
  }),
  set: jest.fn(() => {
    throw new Error(REDIS_ERROR_MESSAGE);
  }),
};

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
      app.locals.draftStoreClient = mockDraftStore;
    });

    it('should return already paid page successfully', async () => {
      await request(app).get(CITIZEN_ALREADY_PAID_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Have you paid the claimant the amount you admit you owe?');
      });
    });

    it('should return status 500 when there is an error', async () => {
      app.locals.draftStoreClient = mockGetExceptionDraftStore;
      await request(app)
        .get(CITIZEN_ALREADY_PAID_URL).expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toMatchObject({error: REDIS_ERROR_MESSAGE});
        });
    });
  });

  describe('on POST', () => {
    beforeEach(() => {
      app.locals.draftStoreClient = mockDraftStore;
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
        .send({alreadyPaid: false})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIM_TASK_LIST_URL);
        });
    });

    it('should redirect to claim task list if selected option is yes', async () => {
      await request(app)
        .post(CITIZEN_ALREADY_PAID_URL)
        .send({alreadyPaid: true})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIM_TASK_LIST_URL);
        });
    });

    it('should return 500 status when there is error', async () => {
      app.locals.draftStoreClient = mockGetExceptionDraftStore;
      await request(app)
        .post(CITIZEN_ALREADY_PAID_URL)
        .send({alreadyPaid: 'foo'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toMatchObject({error: REDIS_ERROR_MESSAGE});
        });
    });
  });
});
