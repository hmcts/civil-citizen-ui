import csurf from '@dr.pogodin/csurf';
import type {Application} from 'express';
import { isTestingSupportDraftUrl } from 'modules/oidc';

export class CSRFToken {
  public enableFor(app: Application): void {
    app.use((req, res, next) => {
      if (req.path.startsWith('/eligibility') || req.path.startsWith('/first-contact') || isTestingSupportDraftUrl(req.originalUrl)) {
        return next();
      }
      return csurf()(req, res, next);
    });
    app.use((req, res, next) => {
      if (!(req.path.startsWith('/eligibility') || req.path.startsWith('/first-contact')) && !isTestingSupportDraftUrl(req.originalUrl)) {
        res.locals.csrf = req.csrfToken();
      }
      next();
    });
  }
}
