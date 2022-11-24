import {CLAIM_SUBMITTED_URL} from 'routes/urls';

import nock from 'nock';
import request from 'supertest';
import config from 'config';
import {mockCivilClaim} from '../../../../utils/mockDraftStore';

const {app} = require('../../../../../main/app');

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('Claim - Claim Submitted', () => {
  const idamServiceUrl: string = config.get('services.idam.url');
  const citizenRoleToken: string = config.get('citizenRoleToken');

  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return claim submitted page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;

      await request(app)
        .get(CLAIM_SUBMITTED_URL)
        .expect((res) => {
          console.log(res.text);
          expect(res.status).toBe(200);
          expect(res.text).toContain('Claim submitted');
        });
    });
  });
});
