import csurf from 'csurf';
import type {Application} from 'express';
import { isTestingSupportDraftUrl } from 'modules/oidc';

export class CSRFToken {
  public enableFor(app: Application): void {
    app.use((req, res, next) => {
      if (req.path.startsWith('/eligibility') || req.path.startsWith('/first-contact') || isTestingSupportDraftUrl(req.originalUrl)) {
        return next();
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return csurf()(req as any, res as any, next);
    });
    app.use((req, res, next) => {
      if (!(req.path.startsWith('/eligibility') || req.path.startsWith('/first-contact')) && !isTestingSupportDraftUrl(req.originalUrl)) {
        res.locals.csrf = req.csrfToken();
      }
      next();
    });
  }
}
