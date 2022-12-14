import {CLAIM_CONFIRMATION_URL} from 'routes/urls';

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

  // const claimId = '1645882162449409';
  const claimId = '1111111111';

  nock('http://localhost:3000')
    .get(CLAIM_CONFIRMATION_URL.replace(':id', claimId))
    .reply(200, {id: claimId});

  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return claim submitted page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;

      await request(app)
        .get(CLAIM_CONFIRMATION_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Claim submitted');
        });
    });

    it('should contain proper claim ID', async () => {
      app.locals.draftStoreClient = mockCivilClaim;

      await request(app)
        .get(CLAIM_CONFIRMATION_URL.replace(':id', claimId))
        .expect(res => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Claim submitted');
          expect(res.text).toContain(claimId);
        });
    });

    it('should contain help with fees info', async () => {
      app.locals.draftStoreClient = mockCivilClaim;

      const text = 'Your claim will be issued once your Help With Fees application has been confirmed.';
      await request(app)
        .get(CLAIM_CONFIRMATION_URL.replace(':id', claimId))
        .expect(res => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Claim submitted');
          expect(res.text).toContain(text);

        });
    });
  });
});
