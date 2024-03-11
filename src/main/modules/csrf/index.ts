import csurf from 'csurf';
import type {Application} from 'express';
import { isTestingSupportDraftUrl } from 'modules/oidc';

export class CSRFToken {
  public enableFor(app: Application): void {
    app.use((req, res, next) => {
      if (isTestingSupportDraftUrl(req.originalUrl)) {
        return next();
      }
      return csurf()(req, res, next);
    });
    app.use((req, res, next) => {
      if (!isTestingSupportDraftUrl(req.originalUrl)) {
        res.locals.csrf = req.csrfToken();
      }
      next();
    });
  }
}
