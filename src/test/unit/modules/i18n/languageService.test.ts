import {Request, Response, NextFunction} from 'express';
import {setLanguage} from 'modules/i18n/languageService';

describe('languageService', () => {
  const MOCK_NEXT = jest.fn() as NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should set lang from query parameter when present', () => {
    const req = {
      query: {lang: 'cy'},
      cookies: {lang: 'en'},
    } as unknown as Request;
    const res = {locals: {}} as unknown as Response;

    setLanguage(req, res, MOCK_NEXT);

    expect(res.locals.lang).toBe('cy');
    expect(MOCK_NEXT).toHaveBeenCalledWith();
  });

  it('should set lang from cookie when query is missing', () => {
    const req = {
      query: {},
      cookies: {lang: 'cy'},
    } as unknown as Request;
    const res = {locals: {}} as unknown as Response;

    setLanguage(req, res, MOCK_NEXT);

    expect(res.locals.lang).toBe('cy');
    expect(MOCK_NEXT).toHaveBeenCalledWith();
  });

  it('should default lang to en when query and cookie are missing', () => {
    const req = {
      query: {},
      cookies: {},
    } as unknown as Request;
    const res = {locals: {}} as unknown as Response;

    setLanguage(req, res, MOCK_NEXT);

    expect(res.locals.lang).toBe('en');
    expect(MOCK_NEXT).toHaveBeenCalledWith();
  });

  it('should prefer query lang over cookie lang', () => {
    const req = {
      query: {lang: 'en'},
      cookies: {lang: 'cy'},
    } as unknown as Request;
    const res = {locals: {}} as unknown as Response;

    setLanguage(req, res, MOCK_NEXT);

    expect(res.locals.lang).toBe('en');
    expect(MOCK_NEXT).toHaveBeenCalledWith();
  });
});
