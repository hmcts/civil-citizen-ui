import express from 'express';
import * as path from 'path';
import {configure} from 'nunjucks';
import request from 'supertest';
import unauthorisedController from 'routes/unauthorisedController';

describe('unauthorisedController', () => {
  const viewPaths = [
    path.resolve(__dirname, '../../../main/views'),
    path.resolve(__dirname, '../../../../node_modules/govuk-frontend/dist'),
  ];

  it('renders the unauthorised page as English when the selected language is Welsh', async () => {
    const app = express();
    app.set('views', viewPaths[0]);
    app.set('view engine', 'njk');
    configure(viewPaths, {express: app});
    app.use((_req, res, next) => {
      res.locals.htmlLang = 'cy';
      next();
    });
    app.use(unauthorisedController);

    const response = await request(app).get('/unauthorised');

    expect(response.status).toBe(200);
    expect(response.text).toContain('<html lang="en"');
    expect(response.text).toContain('<h1 class="govuk-heading-xl">Unauthorised</h1>');
  });
});
