import {Response} from 'express';
import cookiesController, {defaultCookiePreferences} from 'routes/features/public/cookiesController';
import {COOKIES_URL, DASHBOARD_URL} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, getRouteHandler} from '../../../../utils/getRouteHandler';

const pageTitle = 'PAGES.COOKIES.TITLE';
const viewPath = 'features/public/cookies/cookies-view';

const invoke = async (method: 'get' | 'post', req: Partial<AppRequest>) => {
  const res = createMockResponse();
  await getRouteHandler(cookiesController, method, COOKIES_URL)(
    req as AppRequest,
    res as unknown as Response,
    jest.fn(),
  );
  return res;
};

describe('Cookies page', () => {
  it('renders the default cookie preferences', async () => {
    const res = await invoke('get', {cookies: {}});

    expect(res.render).toHaveBeenCalledWith(viewPath, {
      redirectUrl: DASHBOARD_URL,
      cookiePreferences: defaultCookiePreferences,
      pageTitle,
    });
  });

  it('renders the saved cookie preferences', async () => {
    const saved = {analytics: 'on', apm: 'on'};
    const res = await invoke('get', {cookies: {'money-claims-cookie-preferences': JSON.stringify(saved)}});

    expect(res.render).toHaveBeenCalledWith(viewPath, {
      redirectUrl: DASHBOARD_URL,
      cookiePreferences: saved,
      pageTitle,
    });
  });

  it('saves the posted cookie preferences', async () => {
    const res = await invoke('post', {cookies: {}, body: {analytics: 'off', apm: 'on'}});

    expect(res.cookie).toHaveBeenCalledWith(
      'money-claims-cookie-preferences',
      {analytics: 'off', apm: 'on'},
      {sameSite: 'lax'},
    );
    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      cookiePreferences: {analytics: 'off', apm: 'on'},
      redirectUrl: DASHBOARD_URL,
      pageTitle,
    }));
  });
});
