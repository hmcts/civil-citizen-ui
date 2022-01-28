import request from 'supertest';

import {app} from '../../../main/app';

// TODO: replace this sample test with proper route tests for your application
describe('Home page', () => {
  describe('on GET', () => {
    test('should return sample home page', async () => {
      await request(app)
        .get('/')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Default page template');
        });
    });
  });
});

afterAll(done => {
  // Closing Redis connection to allow Jest to exit successfully.
  app.locals.draftStorageClient.quit();
  done();
});
