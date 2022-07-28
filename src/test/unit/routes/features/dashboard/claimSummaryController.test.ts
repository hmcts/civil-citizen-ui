import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';

import {DEFENDANT_SUMMARY_URL} from '../../../../../main/routes/urls';
import {
  mockCivilClaimUndefined,
} from '../../../../utils/mockDraftStore';
import CivilClaimResponseMock from '../../../../utils/mocks/civilClaimResponseMock.json';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('Claim summary', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });
  describe('on GET', () => {
    it('should return your claim summary from civil-service', async () => {
      nock('http://localhost:4000')
        .get('/cases/5129')
        .reply(200, CivilClaimResponseMock);
      app.locals.draftStoreClient = mockCivilClaimUndefined;
      await request(app)
        .get(DEFENDANT_SUMMARY_URL.replace(':id', '5129'))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Mr. Jan Clark v Version 1');
          expect(res.text).toContain('000MC009');
          expect(res.text).toContain('Latest update');
          expect(res.text).toContain('Documents');
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      nock('http://localhost:4000')
        .get('/cases/5129')
        .reply(200, mockCivilClaimUndefined);
      await request(app)
        .get(DEFENDANT_SUMMARY_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
        });
    });
  });
});
