import {NextFunction, Request, Response} from 'express';
import * as path from 'path';
import {configure} from 'nunjucks';
import {setLanguage} from 'modules/i18n/languageService';

describe('setLanguage', () => {
  const nunjucks = configure([
    path.resolve(__dirname, '../../../../../node_modules/govuk-frontend/dist'),
  ]);

  const createRequest = (queryLang?: string, cookieLang?: string): Request => ({
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
  ])('$name', ({queryLang, cookieLang, expectedLang}) => {
    const req = createRequest(queryLang, cookieLang);
    const res = createResponse();
    const next = jest.fn() as NextFunction;

    setLanguage(req, res, next);

    expect(res.locals.lang).toBe(expectedLang);
    expect(res.locals.htmlLang).toBe(expectedLang);
    expect(renderDocument(res)).toContain(`<html lang="${expectedLang}"`);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
