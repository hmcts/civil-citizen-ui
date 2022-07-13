import csurf from 'csurf';
import type {Application} from 'express';

export class CSRFToken {
  public enableFor(app: Application): void {
    app.use(csurf(), (req, res, next) => {
      res.locals.csrf = req.csrfToken();
      next();
    });
  }
}