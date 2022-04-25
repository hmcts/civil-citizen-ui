import * as bodyParser from 'body-parser';
import config = require('config');
import cookieParser from 'cookie-parser';
import express from 'express';
import cookieSession from 'cookie-session';
import { Helmet } from './modules/helmet';
import * as path from 'path';
import { HTTPError } from '../main/HttpError';
import { Nunjucks } from './modules/nunjucks';
import { PropertiesVolume } from './modules/properties-volume';
import { AppInsights } from './modules/appinsights';
import { I18Next } from './modules/i18n';
import { HealthCheck } from './modules/health';
import { OidcMiddleware } from './modules/oidc';
import {DraftStoreClient} from './modules/draft-store';
import routes from './routes/routes';

const { Logger } = require('@hmcts/nodejs-logging');
const { setupDev } = require('./development');

const env = process.env.NODE_ENV || 'development';
const developmentMode = env === 'development';
export const cookieMaxAge = 21 * (60 * 1000); // 21 minutes

export const app = express();
app.use(cookieSession({
  name: 'citizen-ui-session',
  secret: 'local',
  maxAge: cookieMaxAge,
  secure: false,
}));

app.locals.ENV = env;
const i18next = I18Next.enableFor(app);

const logger = Logger.getLogger('app');

new PropertiesVolume().enableFor(app);
new DraftStoreClient(Logger.getLogger('draftStoreClient')).enableFor(app);

new AppInsights().enable();
new Nunjucks(developmentMode, i18next).enableFor(app);
new Helmet(config.get('security')).enableFor(app);
new HealthCheck().enableFor(app);
new OidcMiddleware().enableFor(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use((_req, res, next) => {
  res.setHeader(
    'Cache-Control',
    'no-cache, max-age=0, must-revalidate, no-store',
  );
  next();
});

app.use(routes);

setupDev(app,developmentMode);
// returning "not found" page for requests with paths not resolved by the router
app.use((_req, res) => {
  res.status(404);
  res.render('not-found');
});

// error handler
app.use((err: HTTPError, _req: express.Request, res: express.Response) => {
  logger.error(`${err.stack || err}`);

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = env === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});
