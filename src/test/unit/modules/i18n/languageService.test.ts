import {NextFunction, Request, Response} from 'express';
import {setLanguage} from 'modules/i18n/languageService';

describe('setLanguage', () => {
  const createRequest = (queryLang?: unknown, cookieLang?: unknown): Request => ({
    query: queryLang ? {lang: queryLang} : {},
    cookies: cookieLang ? {lang: cookieLang} : {},
  } as unknown as Request);

  const createResponse = (): Response => ({
    locals: {},
  } as Response);

  it('sets lang and htmlLang from the Welsh query parameter', () => {
    const req = createRequest('cy');
    const res = createResponse();
    const next = jest.fn() as NextFunction;

    setLanguage(req, res, next);

    expect(res.locals.lang).toBe('cy');
    expect(res.locals.htmlLang).toBe('cy');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('sets lang and htmlLang from the Welsh cookie when there is no query parameter', () => {
    const req = createRequest(undefined, 'cy');
    const res = createResponse();
    const next = jest.fn() as NextFunction;

    setLanguage(req, res, next);

    expect(res.locals.lang).toBe('cy');
    expect(res.locals.htmlLang).toBe('cy');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('defaults lang and htmlLang to English', () => {
    const req = createRequest();
    const res = createResponse();
    const next = jest.fn() as NextFunction;

    setLanguage(req, res, next);

    expect(res.locals.lang).toBe('en');
    expect(res.locals.htmlLang).toBe('en');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('defaults lang and htmlLang to English for unsupported language values', () => {
    const req = createRequest('fr');
    const res = createResponse();
    const next = jest.fn() as NextFunction;

    setLanguage(req, res, next);

    expect(res.locals.lang).toBe('en');
    expect(res.locals.htmlLang).toBe('en');
    expect(next).toHaveBeenCalledTimes(1);
  });
});
