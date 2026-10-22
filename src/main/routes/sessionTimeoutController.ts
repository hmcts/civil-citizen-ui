import {Router, Response} from 'express';
import {AppRequest} from 'models/AppRequest';
import {SESSION_EXTEND_URL, SESSION_TIMEOUT_URL, SIGN_OUT_URL} from 'routes/urls';

const sessionTimeoutController = Router();

sessionTimeoutController.get(SESSION_EXTEND_URL, (req: AppRequest, res: Response) => {
  if (!req.session?.user) {
    return res.status(401).json({extended: false});
  }

  // Mark the session dirty and touch it so the explicit session-extension
  // request renews the shared cookie for every tab.
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
    // Let the normal logout handler destroy the session so it can still read
    // the user's id_token and pass it as id_token_hint to IDAM.
    return res.redirect(SIGN_OUT_URL);
  }

  return renderTimeoutPage();
});

export default sessionTimeoutController;
