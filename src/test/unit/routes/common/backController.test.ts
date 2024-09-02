import request from 'supertest';
import {app} from '../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  BACK_URL,
  ROOT_URL,
} from 'routes/urls';
import {Session} from 'express-session';

jest.mock('../../../../main/modules/oidc');
jest.mock('../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../main/modules/utilityService');

const CONTROLLER_URL = BACK_URL;

describe('Back controller ', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should redirect to / req.session.history is undefined ', async () => {

      app.request['session'] = { 'history': [] } as unknown as Session;

      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(ROOT_URL);

        });
    });

    it('should redirect to preview screen', async () => {

      app.request['session'] = { 'history': Array.of('screen1', 'screen2') } as unknown as Session;

      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual('screen1');
        });
    });

    it('should redirect to / when has just one screen', async () => {

      app.request['session'] = { 'history': Array.of('screen1') } as unknown as Session;

      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(ROOT_URL);
        });
    });
  });

});
