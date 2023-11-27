import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {EXPERT_GUIDANCE_URL, PERMISSION_FOR_EXPERT_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../../main/modules/oidc');

describe('Using an expert in small claims', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on GET', () => {
    it('should return Using an expert in small claims page', async () => {
      await request(app)
        .get(EXPERT_GUIDANCE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.EXPERT_GUIDANCE_TITLE);
        });
    });
  });

  describe('on POST', () => {
    it('should redirect to Permission for expert page', async () => {
      await request(app)
        .post(EXPERT_GUIDANCE_URL)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(PERMISSION_FOR_EXPERT_URL);
        });
    });
  });
});
