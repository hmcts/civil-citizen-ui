import {app} from '../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');


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
          expect(res.text).toContain('dateOfBirth must be a Date instance');
          expect(res.text).toContain('year must not be less than 1872');
          expect(res.text).toContain('month must not be less than 1');
          expect(res.text).toContain('day must not be less than 1');
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
          expect(res.text).toContain('year must not be less than 1872');
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
          expect(res.text).toContain('year must not be less than 1872');
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
          expect(res.text).toContain('Please enter a date in the past for date of birth');
        });
    });

  });

});
