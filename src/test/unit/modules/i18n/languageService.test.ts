import cookieParser from 'cookie-parser';
import express, {NextFunction, Request, Response} from 'express';
import * as path from 'path';
import {configure} from 'nunjucks';
import request from 'supertest';
import {setLanguage} from 'modules/i18n/languageService';
import unauthorisedController from 'routes/unauthorisedController';

describe('setLanguage', () => {
  const viewPaths = [
    path.resolve(__dirname, '../../../../main/views'),
    path.resolve(__dirname, '../../../../../node_modules/govuk-frontend/dist'),
  ];
  const nunjucks = configure(viewPaths);

  const createRequest = (queryLang?: unknown, cookieLang?: unknown): Request => ({
    query: queryLang ? {lang: queryLang} : {},
    cookies: cookieLang ? {lang: cookieLang} : {},
  } as unknown as Request);

  const createResponse = (): Response => ({
    locals: {},
  } as Response);

  const renderDocument = (res: Response): string => {
    return nunjucks.render('govuk/template.njk', res.locals);
  };

  it.each([
    {
      name: 'renders the page as Welsh when the query parameter overrides an English cookie',
      queryLang: 'cy',
      cookieLang: 'en',
      expectedLang: 'cy',
    },
    {
      name: 'renders the page as English when the query parameter overrides a Welsh cookie',
      queryLang: 'en',
      cookieLang: 'cy',
      expectedLang: 'en',
    },
    {
      name: 'renders the page as Welsh from the cookie when there is no query parameter',
      queryLang: undefined,
      cookieLang: 'cy',
      expectedLang: 'cy',
    },
    {
      name: 'renders the page as English by default',
      queryLang: undefined,
      cookieLang: undefined,
      expectedLang: 'en',
    },
    {
      name: 'uses a Welsh cookie when the query parameter is unsupported',
      queryLang: 'fr',
      cookieLang: 'cy',
      expectedLang: 'cy',
    },
    {
      name: 'renders the page as English when the cookie is unsupported',
      queryLang: undefined,
      cookieLang: 'fr',
      expectedLang: 'en',
    },
    {
      name: 'uses the first supported repeated query parameter',
      queryLang: ['fr', 'cy', 'en'],
      cookieLang: 'en',
      expectedLang: 'cy',
    },
    {
      name: 'normalises a regional Welsh query parameter',
      queryLang: 'cy-GB',
      cookieLang: 'en',
      expectedLang: 'cy',
    },
    {
      name: 'normalises a regional English query parameter',
      queryLang: 'en-GB',
      cookieLang: 'cy',
      expectedLang: 'en',
    },
    {
      name: 'normalises a mixed-case regional Welsh query parameter',
      queryLang: 'Cy-gb',
      cookieLang: 'en',
      expectedLang: 'cy',
    },
    {
      name: 'normalises an uppercase Welsh query parameter',
      queryLang: 'CY',
      cookieLang: 'en',
      expectedLang: 'cy',
    },
    {
      name: 'uses an English cookie when a Welsh regional value is malformed',
      queryLang: 'cy-!',
      cookieLang: 'en',
      expectedLang: 'en',
    },
  ])('$name', ({queryLang, cookieLang, expectedLang}) => {
    const req = createRequest(queryLang, cookieLang);
    const res = createResponse();
    const next = jest.fn() as NextFunction;

    setLanguage(req, res, next);

    expect(res.locals.lang).toBe(expectedLang);
    expect(res.locals.htmlLang).toBe(expectedLang);
    expect(req.query.lang).toBe(queryLang === undefined ? undefined : expectedLang);
    expect(req.cookies.lang).toBe(expectedLang);
    expect(renderDocument(res)).toContain(`<html lang="${expectedLang}"`);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('provides a canonical language to downstream Express handlers', async () => {
    const app = express();
    app.use(cookieParser());
    app.use(setLanguage);
    app.get('/', (req, res) => {
      res.json({
        cookieLang: req.cookies.lang,
        htmlLang: res.locals.htmlLang,
        queryLang: req.query.lang,
      });
    });

    const response = await request(app)
      .get('/?lang=fr&lang=CY')
      .set('Cookie', 'lang=en');

    expect(response.body).toEqual({
      cookieLang: 'cy',
      htmlLang: 'cy',
      queryLang: 'cy',
    });
  });

  it('keeps the unauthorised page language as English when the selected language is Welsh', async () => {
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
