import {Application, Request, Response} from 'express';
import Axios from 'axios';
import config from 'config';
import {SIGN_IN_URL,CALLBACK_URL,DASHBOARD} from '../../routes/urls';
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

    server.get(SIGN_IN_URL, (req: Request, res) => {
      res.redirect(loginUrl + '?client_id=' + clientId + '&response_type=code&redirect_uri=' + encodeURI(redirectUri));
    });

    server.get(CALLBACK_URL, async (req: Request, res: Response) => {
      if (typeof req.query.code === 'string') {
        await Axios.post(
          tokenUrl,
          `client_id=${clientId}&client_secret=${clientSecret}&grant_type=authorization_code&redirect_uri=${encodeURIComponent(redirectUri)}&code=${encodeURIComponent(req.query.code as string)}`,
          {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        );
        res.redirect(DASHBOARD);
      }else {
        res.redirect(SIGN_IN_URL);
      }
    });
  }
}
