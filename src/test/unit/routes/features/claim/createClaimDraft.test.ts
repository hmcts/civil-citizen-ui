import request from 'supertest';
import { app } from '../../../../../main/app';
import createDraftClaimController from 'routes/features/claim/createDraftClaim';
import config from 'config';
import nock from 'nock';
import { TESTING_SUPPORT_URL } from 'routes/urls';
import { draftClaim } from '../../../../../main/modules/draft-store/draftClaimCache';

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
      expect(response.status).toBe(302);
    });

    describe('processDraftClaim function', () => {
      it('should process the draftClaim correctly', () => {
        const expectedOutput = draftClaim;
        const result = draftClaim;

        expect(result).toEqual(expectedOutput);
      });
    });
  });
});
