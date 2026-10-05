import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import config from 'config';
import {Helmet} from '../../../main/modules/helmet';

describe('HTTP security headers', () => {
  const app = express();
  app.use(cookieParser());
  new Helmet(config.get('security')).enableFor(app);
  app.get('/', (_req, res) => res.send('OK'));

  it('blocks embedded objects and sends one year of HSTS without preload', async () => {
    const response = await request(app).head('/');
    expect(response.status).toBe(200);
    expect(response.headers['content-security-policy'].split(';')).toContain("object-src 'none'");
    expect(response.headers['strict-transport-security']).toBe('max-age=31536000; includeSubDomains');
  });
});
