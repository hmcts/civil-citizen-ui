import {Application, NextFunction, Request, Response} from 'express';
import Axios from 'axios';
import config from 'config';
import jwt_decode from 'jwt-decode';

/**
 * Adds the oidc middleware to add oauth authentication
 */
export class OidcMiddleware {

  public enableFor(server: Application): void {
    const loginUrl: string = config.get('services.idam.authorizationURL');
    const tokenUrl: string = config.get('services.idam.tokenURL');
    const clientId: string = config.get('services.idam.clientID');
    const clientSecret: string = config.get('services.idam.clientSecret');
    const redirectUri: string = config.get('services.idam.callbackURL');

    server.get('/login', (req: Request, res) => {
      res.redirect(loginUrl + '?client_id=' + clientId + '&response_type=code&redirect_uri=' + encodeURI(redirectUri));
    });

    server.get('/oauth2/callback', async (req: Request, res: Response) => {
      const response = await Axios.post(
        tokenUrl,
        `client_id=${clientId}&client_secret=${clientSecret}&grant_type=authorization_code&redirect_uri=${encodeURIComponent(redirectUri)}&code=${encodeURIComponent(req.query.code as string)}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      req.session.user = response.data;
      req.session.user!.jwt = jwt_decode(response.data.id_token);
      req.session.save(() => res.redirect('/'));
    });

    server.get('/logout', function(req: Request, res){
      req.session.user = undefined;
      req.session.save(() => res.redirect('/'));
    });

    server.use((req: Request, res: Response, next: NextFunction) => {
      if (req.session.user) {
        res.locals.isLoggedIn = true;

        return next();
      }
      res.redirect('/login');
    });

  }

}

declare module 'express-session' {
  export interface SessionData {
    user: Record<string, unknown>
  }
}
