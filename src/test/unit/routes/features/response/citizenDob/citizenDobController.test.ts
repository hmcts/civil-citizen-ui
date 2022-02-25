import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {VALID_DATE, VALID_DAY, VALID_MONTH, VALID_YEAR} from '../../../../../../main/common/form/validationErrors/errorMessageConstants';
import {createClient} from 'redis';
import {mockCreateClient} from '../../../../../utils/mockCreateClient';

jest.mock('redis');
jest.mock('../../../../../../main/modules/oidc');
mockCreateClient(createClient);

const {app} = require('../../../../../../main/app');


describe('Citizen date of birth', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    test('should return citizen date of birth page', async () => {
      await request(app)
        .get('/your-dob')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Enter your date of birth');
        });
    });
  });

  describe('on POST', () => {
    test('should return errors on no input', async () => {
      await request(app)
        .post('/your-dob')
        .send('year=')
        .send('month=')
        .send('day=')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_DATE);
          expect(res.text).toContain(VALID_DAY);
          expect(res.text).toContain(VALID_MONTH);
          expect(res.text).toContain(VALID_YEAR);
        });
    });
    test('should return error on year less than 1872', async () => {
      await request(app)
        .post('/your-dob')
        .send('year=1871')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_YEAR);
        });
    });
    test('should return error on empty year', async () => {
      await request(app)
        .post('/your-dob')
        .send('year=')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_YEAR);
        });
    });
    test('should return error on future date', async () => {
      await request(app)
        .post('/your-dob')
        .send('year=2400')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_DATE);
        });
    });
    test('should accept a valid input', async () => {
      const mockDraftStore = {
        set: jest.fn(() => Promise.resolve({ data: {} })),
      };
      app.locals.draftStoreClient = mockDraftStore;
      await request(app)
        .post('/your-dob')
        .send('year=2000')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

  });

});
