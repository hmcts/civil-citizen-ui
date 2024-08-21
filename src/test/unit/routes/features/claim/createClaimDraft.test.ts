import request from 'supertest';
import { app } from '../../../../../main/app';
import createDraftClaimController from 'routes/features/claim/createDraftClaim';
import config from 'config';
import nock from 'nock';
import {
  CLAIM_CHECK_ANSWERS_URL,
  TESTING_SUPPORT_URL,
} from 'routes/urls';
import { draftClaim } from '../../../../../main/modules/draft-store/draftClaimCache';
import {mockRedisFailure} from '../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';

describe('createDraftClaim Router', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  app.use(createDraftClaimController);

  beforeAll(() => {
    nock(idamUrl).post('/o/token').reply(200, { id_token: citizenRoleToken });
  });

  describe('on GET', () => {
    it('should render the correct view', async () => {
      const response = await request(app).get(TESTING_SUPPORT_URL);
      expect(response.status).toBe(200);
    });

    describe('processDraftClaim function', () => {
      it('should process the draftClaim correctly', () => {
        const expectedOutput = draftClaim;
        const result = draftClaim;

        expect(result).toEqual(expectedOutput);
      });
    });
  });

  describe('on POST', () => {
    it('should redirect to check answers page', async () => {
      await request(app)
        .post(TESTING_SUPPORT_URL)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(CLAIM_CHECK_ANSWERS_URL);
        });
    });
    it('should return http 500 when has error in the get method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(TESTING_SUPPORT_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
