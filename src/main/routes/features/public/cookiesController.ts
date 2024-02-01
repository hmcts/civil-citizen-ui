import {RequestHandler, Response, Router} from 'express';
import {AppRequest} from 'models/AppRequest';
import {CookiesModel} from 'form/models/cookies';
import {
  COOKIES_URL,
  DASHBOARD_URL,
} from 'routes/urls';

const cookiesController = Router();
const cookiesViewPath = 'features/public/cookies/cookies-view';

export const defaultCookiePreferences = {
  analytics: 'off',
  apm: 'off',
};

cookiesController.get(COOKIES_URL, (req: AppRequest, res: Response) => {
  const cookiePreferences = req.cookies['money-claims-cookie-preferences'] ? JSON.parse(req.cookies['money-claims-cookie-preferences']) : defaultCookiePreferences;
  res.render(cookiesViewPath, {redirectUrl: DASHBOARD_URL, cookiePreferences});
});

cookiesController.post(COOKIES_URL, (async (req: AppRequest<CookiesModel>, res: Response) => {
  const cookie = req.cookies['money-claims-cookie-preferences'] ? JSON.parse(req.cookies['money-claims-cookie-preferences']) : {};
  cookie.analytics = req.body.analytics;
  cookie.apm = req.body.apm;
  res.cookie('money-claims-cookie-preferences', cookie);
  res.render(cookiesViewPath, {
    cookiePreferences: cookie,
    redirectUrl: DASHBOARD_URL,
  });
}) as RequestHandler);

export default cookiesController;
