import csurf from 'csurf';
import type {Application, Request, Response, NextFunction} from 'express';
import { isTestingSupportDraftUrl } from 'modules/oidc';

export class CSRFToken {
  public enableFor(app: Application): void {
    app.use((req, res, next) => {
      if (req.path.startsWith('/eligibility') || req.path.startsWith('/first-contact') || isTestingSupportDraftUrl(req.originalUrl)) {
        return next();
      }
      return csurf()(req as unknown as Request, res as unknown as Response, next as NextFunction);
    });
    app.use((req, res, next) => {
      if (!(req.path.startsWith('/eligibility') || req.path.startsWith('/first-contact')) && !isTestingSupportDraftUrl(req.originalUrl)) {
        res.locals.csrf = req.csrfToken();
      }
      next();
    });
  }
}