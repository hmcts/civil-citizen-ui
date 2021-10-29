const expect = require('chai');
const request = require('supertest');
  
const { app } = require('../main/app');
  
// TODO: replace this sample test with proper smoke tests later 
describe('Dummy Smoke test - Home page', () => {
    describe('on GET', () => {
      test('should return sample home page', async () => {
        await request(app)
          .get(process.env.TEST_URL)
          .expect((res) => expect(res.status).to.equal(200));
      });
    });
});
  