import * as express from 'express';
import {AppRequest} from '../../../common/models/AppRequest';
import {CookiesModel} from '../../../common/form/models/cookies';

import {
  COOKIES_URL,
  DASHBOARD_URL,
} from '../../../routes/urls';

const cookiesController = express.Router();
const cookiesViewPath = 'features/public/cookies/cookies-view';

export const defaultCookiePreferences = {
  analytics: 'off',
  apm: 'off',
};

cookiesController.get(COOKIES_URL, (req: AppRequest, res: express.Response) => {
  const cookiePreferences = req.cookies['money-claims-cookie-preferences'] ? req.cookies['money-claims-cookie-preferences'] : defaultCookiePreferences;
  res.render(cookiesViewPath, {cookiePreferences});
});

cookiesController.post(COOKIES_URL, async (req: AppRequest<CookiesModel>, res: express.Response) => {
  const cookie = req.cookies['money-claims-cookie-preferences'] ? req.cookies['money-claims-cookie-preferences'] : {};
  cookie.analytics = req.body.analytics;
  cookie.apm = req.body.apm;
  res.cookie('money-claims-cookie-preferences', cookie);
  res.render(cookiesViewPath, {
    cookiePreferences: cookie,
    isSavedPreferencesBannerDisplayed: true,
    redirectUrl: DASHBOARD_URL,  
  });
});

export default cookiesController;
