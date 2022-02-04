import {Application, Request, Response} from 'express';
import config from 'config';
import {AppRequest, UserDetails} from '../../common/models/AppRequest';
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
      console.info('INSIDE CALLBACK ROUTE');
      if (typeof req.query.code === 'string') {
        console.info('INSIDE IF STMT');
        console.info(`req.query.code: ${req.query.code}`);
        // req.session.user = await getUserDetails(redirectUri, req.query.code);
        const user: UserDetails = await getUserDetails(redirectUri, req.query.code);
        console.info(JSON.stringify(user));
        // req.session.save(() => ...);
        res.redirect('/info');
      } else {
        res.redirect('/login');
      }
    });

    // app.use((req: AppRequest, res: Response, next: NextFunction) => {
    //   next();
    //   if (req.session.user) {
    //     const roles = req.session.user?.roles;
    //     if (roles && roles.includes('civil-citizen')){
    //       return next();
    //     }
    //   }
    // });
  }
}
