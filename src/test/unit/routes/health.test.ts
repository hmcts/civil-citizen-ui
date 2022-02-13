import request from 'supertest';

import {app} from '../../../main/app';

describe('Health Check', () => {

  describe('on GET', () => {
    test('should return health check object', async () => {
      await request(app)
        .get('/health')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.body.status).toBe('UP');
        });
    });
  });
});
