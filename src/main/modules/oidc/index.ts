import {Application, NextFunction, Request, Response} from 'express';
import config from 'config';
import {AppRequest} from '../../common/models/AppRequest';
import {getUserDetails} from '../../app/auth/user/oidc';

/**
 * Adds the oidc middleware to add oauth authentication
 */
export class OidcMiddleware {

  public enableFor(app: Application): void {
    const loginUrl: string = config.get('services.idam.authorizationURL');
    const clientId: string = config.get('services.idam.clientID');
    const redirectUri: string = config.get('services.idam.callbackURL');

    app.get('/login', (req: Request, res) => {
      res.redirect(loginUrl + '?client_id=' + clientId + '&response_type=code&redirect_uri=' + encodeURI(redirectUri));
    });

    app.get('/oauth2/callback', async (req: AppRequest, res: Response) => {
      if (typeof req.query.code === 'string') {
        req.session.user = await getUserDetails(redirectUri, req.query.code);
        req.session.save(() => {
          if (req.session.user?.roles?.includes('civil-citizen')) {
            return res.redirect('/dashboard');
          }
          return res.render('unauthorised');
        });
      } else {
        res.redirect('/');
      }
    });

    app.get('/logout', (req: AppRequest, res: Response) => {
      req.session.user = undefined;
      res.redirect('/');
    });

    app.use((req: AppRequest, res: Response, next: NextFunction) => {

      if (req.session.user) {
        if (req.session?.user?.roles?.includes('civil-citizen')) {
          return next();
        }
        return res.redirect('/unauthorised');
      }
      res.redirect('/login');

    });
  }
}
