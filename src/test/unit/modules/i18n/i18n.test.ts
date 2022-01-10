const request = require('supertest');

const {app} = require('../../../../main/app');

describe('i18n test - Home page', () => {
  describe('on GET', () => {
    test('should return english home page', async () => {
      await request(app)
        .get('/')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Default page template');
        });
    });
  });
  describe('on GET with request param lang=en', () => {
    test('should return English home page', async () => {
      await request(app)
        .get('/?lang=en')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Default page template');
        });
    });
  });
  describe('on GET with request param lang=cy', () => {
    test('should return Welsh home page', async () => {
      await request(app)
        .get('/?lang=cy')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Tluafed Egap etalpmet');
        });
    });
  });
});
