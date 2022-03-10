import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  VALID_HOUSING,
  VALID_OPTION_SELECTION,
} from '../../../../../../main/common/form/validationErrors/errorMessageConstants';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Citizen residence', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});


  });
  describe('on GET', () => {
    test('should return residence page', async () => {
      await request(app)
        .get('/statement-of-means/residence')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Where do you live?');
        });
    });
  });
  describe('on POST', () => {
    test('should return error when no option selected', async () => {
      await request(app)
        .post('/statement-of-means/residence')
        .send('type=')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_OPTION_SELECTION);
        });
    });
    test('should return error when type is \'Other\' and housing details not provided', async () => {
      const mockDraftStore = {
        set: jest.fn(() => Promise.resolve({data: {}})),
      };
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post('/citizen-phone')
        .send('type=OTHER')
        .send('housingDetails=')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_HOUSING);
        });
    });
  });
});
