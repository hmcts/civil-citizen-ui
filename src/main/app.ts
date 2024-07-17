import * as bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import * as path from 'path';
import session from 'express-session';
import 'express-async-errors';

import {AppInsights} from 'modules/appinsights';
import {Helmet} from 'modules/helmet';
import {Nunjucks} from 'modules/nunjucks';
import {PropertiesVolume} from 'modules/properties-volume';
import {I18Next} from 'modules/i18n';
import {HealthCheck} from 'modules/health';
import {OidcMiddleware} from 'modules/oidc';
import {DraftStoreClient} from 'modules/draft-store';
import {CSRFToken} from 'modules/csrf';
import routes from './routes/routes';
import {setLanguage} from 'modules/i18n/languageService';
import {isServiceShuttered} from './app/auth/launchdarkly/launchDarklyClient';
import {getRedisStoreForSession} from 'modules/utilityService';
import {
  ASSIGN_FRC_BAND_URL,
  BASE_CASE_PROGRESSION_URL,
  BASE_CLAIM_URL,
  BASE_CLAIMANT_RESPONSE_URL,
  BASE_GENERAL_APPLICATION_RESPONSE_URL,
  BASE_GENERAL_APPLICATION_URL, CLAIMANT_RESPONSE_CHECK_ANSWERS_URL,
  CP_FINALISE_TRIAL_ARRANGEMENTS_CONFIRMATION_URL,
  CP_FINALISE_TRIAL_ARRANGEMENTS_URL,
  DQ_DISCLOSURE_OF_DOCUMENTS_URL,
  DQ_MULTITRACK_AGREEMENT_REACHED_URL,
  DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_DETAILS_URL,
  DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_URL,
  DQ_MULTITRACK_DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_URL,
  DQ_MULTITRACK_DISCLOSURE_OF_ELECTRONIC_DOCUMENTS_ISSUES_URL,
  DQ_REQUEST_EXTRA_4WEEKS_URL, FRC_BAND_AGREED_URL,
  HAS_ANYTHING_CHANGED_URL,
  IS_CASE_READY_URL, REASON_FOR_FRC_BAND_URL, RESPONSE_CHECK_ANSWERS_URL,
  STATEMENT_OF_MEANS_URL, SUBJECT_TO_FRC_URL,
  TRIAL_ARRANGEMENTS_HEARING_DURATION,
} from 'routes/urls';
import {statementOfMeansGuard} from 'routes/guards/statementOfMeansGuard';
import {claimantIntentGuard} from 'routes/guards/claimantIntentGuard';
import {createOSPlacesClientInstance} from 'modules/ordance-survey-key/ordanceSurveyKey';
import {trialArrangementsGuard} from 'routes/guards/caseProgression/trialArragement/trialArrangementsGuard';
import {claimIssueTaskListGuard} from 'routes/guards/claimIssueTaskListGuard';
import {ErrorHandler} from 'modules/error';
import {isGAForLiPEnabled} from 'routes/guards/generalAplicationGuard';
import {isCaseProgressionV1Enabled} from 'routes/guards/caseProgressionGuard';
import config = require('config');
import {trackHistory} from 'routes/guards/trackHistory';

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
new AppInsights().enable();

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
    secure: productionMode,
    maxAge: cookieMaxAge,
    sameSite: 'lax',
  },
}));

app.enable('trust proxy');

new Nunjucks(developmentMode).enableFor(app);
new Helmet(config.get('security')).enableFor(app);
new HealthCheck().enableFor(app);
new OidcMiddleware().enableFor(app);

app.use(STATEMENT_OF_MEANS_URL, statementOfMeansGuard);
app.use(BASE_CLAIMANT_RESPONSE_URL, claimantIntentGuard);
app.use([BASE_GENERAL_APPLICATION_URL, BASE_GENERAL_APPLICATION_RESPONSE_URL], isGAForLiPEnabled);
app.use(BASE_CLAIM_URL, claimIssueTaskListGuard);
app.use(BASE_CASE_PROGRESSION_URL, isCaseProgressionV1Enabled);
app.use([CP_FINALISE_TRIAL_ARRANGEMENTS_URL,
  HAS_ANYTHING_CHANGED_URL,
  TRIAL_ARRANGEMENTS_HEARING_DURATION,
  IS_CASE_READY_URL,
  CP_FINALISE_TRIAL_ARRANGEMENTS_CONFIRMATION_URL], trialArrangementsGuard);

app.use([DQ_REQUEST_EXTRA_4WEEKS_URL,
  SUBJECT_TO_FRC_URL,
  FRC_BAND_AGREED_URL,
  ASSIGN_FRC_BAND_URL,
  REASON_FOR_FRC_BAND_URL,
  DQ_MULTITRACK_AGREEMENT_REACHED_URL,
  DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_DETAILS_URL,
  DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_URL,
  DQ_MULTITRACK_DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_URL,
  DQ_DISCLOSURE_OF_DOCUMENTS_URL,
  DQ_MULTITRACK_DISCLOSURE_OF_ELECTRONIC_DOCUMENTS_ISSUES_URL,
  RESPONSE_CHECK_ANSWERS_URL,
  CLAIMANT_RESPONSE_CHECK_ANSWERS_URL], trackHistory);

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
new ErrorHandler().enableFor(app);

setupDev(app,developmentMode);

