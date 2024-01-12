import * as bodyParser from 'body-parser';
import config = require('config');
import cookieParser from 'cookie-parser';

import express from 'express';
import {Helmet} from 'modules/helmet';
import * as path from 'path';
import {HTTPError} from './HttpError';
import {Nunjucks} from 'modules/nunjucks';
import {PropertiesVolume} from 'modules/properties-volume';
import {AppInsights} from 'modules/appinsights';
import {I18Next} from 'modules/i18n';
import {HealthCheck} from 'modules/health';
import {OidcMiddleware} from 'modules/oidc';
import {DraftStoreClient} from 'modules/draft-store';
import {CSRFToken} from 'modules/csrf';
import routes from './routes/routes';
import {setLanguage} from 'modules/i18n/languageService';
import {isServiceShuttered} from './app/auth/launchdarkly/launchDarklyClient';
import {getRedisStoreForSession} from 'modules/utilityService';
import session from 'express-session';
import {
  BASE_CLAIM_URL,
  CP_FINALISE_TRIAL_ARRANGEMENTS_CONFIRMATION_URL,
  CP_FINALISE_TRIAL_ARRANGEMENTS_URL,
  HAS_ANYTHING_CHANGED_URL, IS_CASE_READY_URL,
  STATEMENT_OF_MEANS_URL,
  TRIAL_ARRANGEMENTS_HEARING_DURATION,
} from 'routes/urls';
import {statementOfMeansGuard} from 'routes/guards/statementOfMeansGuard';
import {BASE_CLAIMANT_RESPONSE_URL} from 'routes/urls';
import {claimantIntentGuard} from 'routes/guards/claimantIntentGuard';
import { createOSPlacesClientInstance } from 'modules/ordance-survey-key/ordanceSurveyKey';
import {trialArrangementsGuard} from 'routes/guards/caseProgression/trialArragement/trialArrangementsGuard';
import {claimIssueTaskListGuard} from 'routes/guards/claimIssueTaskListGuard';

const {Logger} = require('@hmcts/nodejs-logging');
const {setupDev} = require('./development');

const env = process.env.NODE_ENV || 'development';
const productionMode = env === 'production';
const developmentMode = env === 'development';
const cookieMaxAge = 21 * (60 * 1000); // 21 minutes
export const app = express();
app.use(cookieParser());
app.use(setLanguage);
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));
app.locals.ENV = env;
I18Next.enableFor(app);

const logger = Logger.getLogger('app');

new PropertiesVolume().enableFor(app);

logger.info('Creating new draftStoreClient');
new DraftStoreClient(Logger.getLogger('draftStoreClient')).enableFor(app);

logger.info('Creating OSplaces Client Instance');
createOSPlacesClientInstance();

logger.info('Adding configuration for session store');
const sessionStore = getRedisStoreForSession();

app.use(session({
  name: 'citizen-ui-session',
  store: sessionStore,
  secret: 'local',
  resave: false,
  saveUninitialized: false,
  cookie : {
    secure: false,
    maxAge: cookieMaxAge,
    sameSite: 'lax',
  },
}));

app.enable('trust proxy');

new AppInsights().enable();
new Nunjucks(developmentMode).enableFor(app);
new Helmet(config.get('security')).enableFor(app);
new HealthCheck().enableFor(app);
new OidcMiddleware().enableFor(app);

app.use(STATEMENT_OF_MEANS_URL, statementOfMeansGuard);
app.use(BASE_CLAIMANT_RESPONSE_URL, claimantIntentGuard);
app.use(BASE_CLAIM_URL, claimIssueTaskListGuard);
app.use([CP_FINALISE_TRIAL_ARRANGEMENTS_URL,
  HAS_ANYTHING_CHANGED_URL,
  TRIAL_ARRANGEMENTS_HEARING_DURATION,
  IS_CASE_READY_URL,
  CP_FINALISE_TRIAL_ARRANGEMENTS_CONFIRMATION_URL], trialArrangementsGuard);

app.use(bodyParser.json({limit: '500mb'}));
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));

app.use((_req, res, next) => {
  res.setHeader(
    'Cache-Control',
    'no-cache, max-age=0, must-revalidate, no-store',
  );
  next();
});

const checkServiceAvailability = async (_req: express.Request, res: express.Response, next: express.NextFunction) => {
  const serviceShuttered = await isServiceShuttered();
  logger.info(`Checking for service availability... ${serviceShuttered}`);
  if (serviceShuttered) {
    res.render('service-unavailable');
  } else {
    next();
  }
};

if (env !== 'test') {
  new CSRFToken().enableFor(app);
  app.use(checkServiceAvailability);
}

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
