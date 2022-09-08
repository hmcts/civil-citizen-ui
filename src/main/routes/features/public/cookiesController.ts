import * as express from 'express';
import {AppRequest} from '../../../common/models/AppRequest';

import {
  COOKIES_URL,
  DASHBOARD_URL,
  SIGN_IN_URL,
} from '../../../routes/urls';

const cookiesController = express.Router();
const cookiesViewPath = 'features/public/cookies/cookies-view';

const defaultCookiePreferences = {
  analytics: 'off',
  apm: 'off',
};

interface CookiesModel {
  analytics: string;
  apm: string;
}

cookiesController.get(COOKIES_URL, (req: AppRequest, res: express.Response) => {
  const cookiePreferences = req.cookies['money-claims-cookie-preferences'] ? req.cookies['money-claims-cookie-preferences'] : defaultCookiePreferences;
  res.render(cookiesViewPath, {cookiePreferences});
});

cookiesController.post(COOKIES_URL, async (req: AppRequest<CookiesModel>, res: express.Response) => {
  const cookie = req.cookies['money-claims-cookie-preferences'] ? req.cookies['money-claims-cookie-preferences'] : {};
  
  cookie.analytics = req.body.analytics;
  cookie.apm = req.body.apm;
  res.cookie('money-claims-cookie-preferences', cookie);
  const redirecURl = req.session.user ? DASHBOARD_URL : SIGN_IN_URL;
  res.render(cookiesViewPath, {
    cookiePreferences: cookie,
    isSavedPreferencesBannerDisplayed: true,
    redirectUrl: redirecURl,  
  });
});

export default cookiesController;
