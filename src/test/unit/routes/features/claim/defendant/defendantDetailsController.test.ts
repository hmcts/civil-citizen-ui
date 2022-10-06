import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {mockCivilClaim} from '../../../../../utils/mockDraftStore';
import {CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL} from '../../../../../../main/routes/urls';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Defendant details controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should render defendant details page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app).get(CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('Enter organisation details');
    });
  });
});
