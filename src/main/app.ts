import * as bodyParser from 'body-parser';
import config = require('config');
import cookieParser from 'cookie-parser';
const session = require('express-session');
import express from 'express';
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
import {CSRFToken} from './modules/csrf';
import routes from './routes/routes';
import {setLanguage} from 'modules/i18n/languageService';
import {isServiceAvailable} from 'app/auth/launchdarkly/launchDarklyClient';
// import { dateFilter } from 'modules/nunjucks/filters/dateFilter';

const { Logger } = require('@hmcts/nodejs-logging');
const { setupDev } = require('./development');
const MemoryStore = require('memorystore')(session);

const env = process.env.NODE_ENV || 'development';
const developmentMode = env === 'development';
export const cookieMaxAge = 21 * (60 * 1000); // 21 minutes

export const app = express();
app.use(session({
  name: 'citizen-ui-session',
  store: new MemoryStore({
    checkPeriod: 86400000, // prune expired entries every 24h
  }),
  secret: 'local',
  resave: true,
  saveUninitialized: true,
  cookie : {
    secure: false,
    maxAge: cookieMaxAge,
  },
}));
app.use(cookieParser());
app.use(setLanguage);
app.use(express.static(path.join(__dirname, 'public')));

app.locals.ENV = env;
I18Next.enableFor(app);

const logger = Logger.getLogger('app');

new PropertiesVolume().enableFor(app);
new DraftStoreClient(Logger.getLogger('draftStoreClient')).enableFor(app);
new AppInsights().enable();
new Nunjucks(developmentMode).enableFor(app);
new Helmet(config.get('security')).enableFor(app);
new HealthCheck().enableFor(app);
new OidcMiddleware().enableFor(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((_req, res, next) => {
  res.setHeader(
    'Cache-Control',
    'no-cache, max-age=0, must-revalidate, no-store',
  );
  next();
});
if (env !== 'test') {
  new CSRFToken().enableFor(app);
}

const checkServiceAvailability = async (_req: express.Request, res: express.Response, next: express.NextFunction) => {
  const isAvailable = await isServiceAvailable();
  logger.info(`Checking for service availability... ${isAvailable}`);
  if (isAvailable) {
    next();
  } else {
    res.render('service-unavailable');
  }
}

app.use(checkServiceAvailability);

app.use(routes);

setupDev(app,developmentMode);
// returning "not found" page for requests with paths not resolved by the router
app.use((_req, res) => {
  res.status(404);
  res.render('not-found');
});

// error handler
app.use((err: HTTPError, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error(`${err.stack || err}`);

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = env === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error', {error: res.locals.error});
});
