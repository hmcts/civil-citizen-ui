const request = require('supertest');
const nock = require('nock');

const {app} = require('../../../../main/app');

describe('i18n test - Dashboard', () => {

  beforeEach(() => {
    nock('http://localhost:8765')
      .get('/cases')
      .reply(200, []);
  });

  describe('on GET', () => {
    test('should return english dashboard page', async () => {
      await request(app)
        .get('/dashboard')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Claims made against you');
        });
    });
  });
  describe('on GET with request param lang=en', () => {
    test('should return English dashboard page', async () => {
      await request(app)
        .get('/dashboard/?lang=en')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Claims made against you');
        });
    });
  });
  describe('on GET with request param lang=cy', () => {
    test('should return Welsh dashboard page', async () => {
      await request(app)
        .get('/dashboard/?lang=cy')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Smialc edam tsniaga uoy');
        });
    });
  });
});
