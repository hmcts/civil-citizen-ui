import {Nunjucks} from '../../../../main/modules/nunjucks';

type Middleware = (req: {path: string; cookies: Record<string, string>; session: {user: {id: string}}}, res: {locals: Record<string, unknown>}, next: jest.Mock) => void;
type TranslateErrors = (keys: Array<{text?: string}>, translate: (key: string) => string, formatValues: Array<{keyError: string; keyToReplace: string; valueToReplace: string}>) => Array<{text: string}>;

jest.mock('nunjucks', () => ({
  configure: jest.fn(() => ({addGlobal: jest.fn(), addFilter: jest.fn()})),
}));

const mockedNunjucks = jest.requireMock('nunjucks') as {configure: jest.Mock};

describe('Nunjucks configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('configures the environment and request locals', () => {
    const app = {
      set: jest.fn(),
      use: jest.fn(),
    };
    new Nunjucks(false).enableFor(app as never);

    expect(app.set).toHaveBeenCalledWith('view engine', 'njk');
    expect(mockedNunjucks.configure).toHaveBeenCalled();

    const middleware = app.use.mock.calls[0][0] as Middleware;
    const req: Middleware extends (req: infer T, res: unknown, next: unknown) => void ? T : never = {
      path: '/test',
      cookies: {},
      session: {user: {id: 'user-id'}},
    };
    const res: {locals: Record<string, unknown>} = {locals: {lang: 'cy'}};
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.locals.pagePath).toBe('/test');
    expect(res.locals.user).toEqual({id: 'user-id'});
    expect(res.locals.sessionTimeout).toEqual(expect.objectContaining({
      idleMinutesBeforeWarning: expect.any(Number),
      minutesModalVisible: expect.any(Number),
      totalSeconds: expect.any(Number),
      expiresAt: expect.any(Number),
      fallbackEndTime: expect.any(String),
    }));
    expect(req.cookies.nonceValue).toEqual(expect.any(String));
    expect(next).toHaveBeenCalled();
  });

  it('translates and formats validation errors', () => {
    new Nunjucks(false).enableFor({set: jest.fn(), use: jest.fn()} as never);
    const results = mockedNunjucks.configure.mock.results;
    const environment = results[results.length - 1].value as {addGlobal: jest.Mock};
    const translateErrors = environment.addGlobal.mock.calls.find(call => call[0] === 'translateErrors')?.[1] as TranslateErrors;
    const translate = (key: string) => `translated ${key}`;

    expect(translateErrors([
      {text: 'name.required'},
      {text: 'address.required'},
      {text: undefined},
    ], translate, [{keyError: 'name.required', keyToReplace: 'name', valueToReplace: 'full name'}])).toEqual([
      {text: 'translated full name.required'},
      {text: 'translated address.required'},
    ]);
  });
});
