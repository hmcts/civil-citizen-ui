import {Router, Response} from 'express';
import {AppRequest} from 'models/AppRequest';
import {SESSION_EXTEND_URL, SESSION_TIMEOUT_URL} from 'routes/urls';

const sessionTimeoutController = Router();

sessionTimeoutController.get(SESSION_EXTEND_URL, (req: AppRequest, res: Response) => {
  if (!req.session?.user) {
    return res.status(401).json({extended: false});
  }

  // Mark the session dirty and touch it so the rolling cookie (cookieMaxAge) renews.
  req.session.sessionExtendedAt = Date.now();
  req.session.touch();
  return res.status(200).json({extended: true});
});

sessionTimeoutController.get(SESSION_TIMEOUT_URL, (req: AppRequest, res: Response) => {
  // Avoid rendering the timeout warning on the signed-out page (locals were set earlier).
  res.locals.user = undefined;
  res.locals.sessionTimeout = undefined;

  const renderTimeoutPage = () => {
    res.render('features/public/session-timeout', {
      pageTitle: 'PAGES.SESSION_TIMEOUT.PAGE_TITLE',
    });
  };

  if (req.session) {
    return req.session.destroy(() => {
      res.clearCookie('citizen-ui-session');
      renderTimeoutPage();
    });
  }

  return renderTimeoutPage();
});

export default sessionTimeoutController;
