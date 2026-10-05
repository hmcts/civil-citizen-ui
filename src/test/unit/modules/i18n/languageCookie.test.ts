import express from 'express';
import 'i18next-http-middleware';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import {I18Next} from '../../../../main/modules/i18n';

describe('language cookie', () => {
  const app = express();
  app.use(cookieParser());
  I18Next.enableFor(app);
  app.get('/', (req, res) => res.send(req.language));

  it.each(['en', 'cy'])('sets a Secure cookie when switching to %s', async language => {
    const response = await request(app).get('/').query({lang: language});
    expect(response.text).toBe(language);
    expect(response.headers['set-cookie']).toEqual(expect.arrayContaining([
      expect.stringMatching(new RegExp(`^lang=${language};.*; Secure(?:;|$)`)),
    ]));
  });

  it('retains Welsh from the cookie on the next request', async () => {
    const response = await request(app).get('/').set('Cookie', 'lang=cy');
    expect(response.text).toBe('cy');
  });
});
