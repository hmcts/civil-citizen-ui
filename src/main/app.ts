import * as bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import * as path from 'path';
import favicon from 'serve-favicon';
import session from 'express-session';
import 'express-async-errors';

import {AppInsights} from 'modules/appinsights';
import {Helmet} from 'modules/helmet';
import {Nunjucks} from 'modules/nunjucks';
import {PropertiesVolume} from 'modules/properties-volume';
import {I18Next} from 'modules/i18n';
import {HealthCheck} from 'modules/health';
import {DraftStoreClient} from 'modules/draft-store';
import {CSRFToken} from 'modules/csrf';
import routes from './routes/routes';
import {setLanguage} from 'modules/i18n/languageService';
import {isServiceShuttered, updateE2EKey} from './app/auth/launchdarkly/launchDarklyClient';
import {getRedisStoreForSession} from 'modules/utilityService';
import {setCaseReferenceCookie} from 'modules/cookie/caseReferenceCookie';
import {
  APPLICATION_TYPE_URL,
  ASSIGN_FRC_BAND_URL,
  BASE_CLAIM_URL,
  BASE_CLAIMANT_RESPONSE_URL,
  BASE_GENERAL_APPLICATION_RESPONSE_URL,
  BASE_GENERAL_APPLICATION_URL, BREATHING_SPACE_INFO_URL,
  CLAIMANT_RESPONSE_CHECK_ANSWERS_URL, COSC_FINAL_PAYMENT_DATE_URL,
  CP_FINALISE_TRIAL_ARRANGEMENTS_CONFIRMATION_URL,
  CP_FINALISE_TRIAL_ARRANGEMENTS_URL,
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL,
  DQ_DISCLOSURE_OF_DOCUMENTS_URL,
  DQ_MULTITRACK_AGREEMENT_REACHED_URL,
  DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_DETAILS_URL,
  DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_URL,
  DQ_MULTITRACK_DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_URL,
  DQ_MULTITRACK_DISCLOSURE_OF_ELECTRONIC_DOCUMENTS_ISSUES_URL,
  DQ_REQUEST_EXTRA_4WEEKS_URL,
  FRC_BAND_AGREED_URL,
  GA_ADD_ANOTHER_APPLICATION_URL,
  GA_AGREE_TO_ORDER_URL,
  GA_AGREEMENT_FROM_OTHER_PARTY_URL,
  GA_APPLICATION_COSTS_URL, GA_ASK_PROOF_OF_DEBT_PAYMENT_GUIDANCE_URL,
  GA_CHECK_ANSWERS_URL, GA_CHECK_YOUR_ANSWERS_COSC_URL,
  GA_CLAIM_APPLICATION_COST_URL, GA_DEBT_PAYMENT_EVIDENCE_COSC_URL,
  GA_HEARING_ARRANGEMENT_URL,
  GA_HEARING_ARRANGEMENTS_GUIDANCE_URL,
  GA_HEARING_CONTACT_DETAILS_URL,
  GA_HEARING_SUPPORT_URL,
  GA_PROVIDE_MORE_INFORMATION_URL,
  GA_REQUESTING_REASON_URL,
  GA_RESPOND_ADDITIONAL_INFO_URL,
  GA_RESPONDENT_AGREEMENT_URL,
  GA_RESPONDENT_HEARING_PREFERENCE_URL,
  GA_RESPONDENT_UPLOAD_DOCUMENT_URL,
  GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT_URL,
  GA_RESPONSE_CHECK_ANSWERS_URL,
  GA_RESPONSE_HEARING_ARRANGEMENT_URL,
  GA_RESPONSE_HEARING_CONTACT_DETAILS_URL,
  GA_RESPONSE_HEARING_SUPPORT_URL,
  GA_RESPONSE_UNAVAILABLE_HEARING_DATES_URL,
  GA_RESPONSE_VIEW_APPLICATION_URL, GA_SUBMIT_OFFLINE,
  GA_UNAVAILABILITY_CONFIRMATION_URL,
  GA_UNAVAILABILITY_RESPONSE_CONFIRMATION_URL,
  GA_UNAVAILABLE_HEARING_DATES_URL,
  GA_UPLOAD_ADDITIONAL_DOCUMENTS_CYA_URL,
  GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL,
  GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_CYA_URL,
  GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_URL,
  GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_CYA_URL,
  GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_URL, GA_UPLOAD_DOCUMENTS_COSC_URL,
  GA_UPLOAD_DOCUMENTS_URL,
  GA_UPLOAD_N245_FORM_URL,
  GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_CYA_URL,
  GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_URL,
  GA_VIEW_APPLICATION_URL,
  GA_WANT_TO_UPLOAD_DOCUMENTS_URL,
  HAS_ANYTHING_CHANGED_URL,
  INFORM_OTHER_PARTIES_URL,
  IS_CASE_READY_URL, MEDIATION_PHONE_CONFIRMATION_URL,
  ORDER_JUDGE_URL,
  PAYING_FOR_APPLICATION_URL, QM_CYA, QM_FOLLOW_UP_CYA, QM_FOLLOW_UP_MESSAGE,
  QM_FOLLOW_UP_URL,
  QM_INFORMATION_URL, QM_SHARE_QUERY_CONFIRMATION,
  QM_START_URL,
  QM_VIEW_QUERY_URL,
  QM_WHAT_DO_YOU_WANT_TO_DO_URL, QUERY_MANAGEMENT_CREATE_QUERY,
  REASON_FOR_FRC_BAND_URL, REQUEST_MORE_TIME_URL,
  RESPONSE_CHECK_ANSWERS_URL, RESPONSE_DEADLINE_OPTIONS_URL,
  SIGN_OUT_URL,
  STATEMENT_OF_MEANS_URL,
  SUBJECT_TO_FRC_URL,
  TEST_SUPPORT_TOGGLE_FLAG_ENDPOINT,
  TRIAL_ARRANGEMENTS_HEARING_DURATION, TYPES_OF_DOCUMENTS_URL, UPLOAD_YOUR_DOCUMENTS_URL,
} from 'routes/urls';
import {statementOfMeansGuard} from 'routes/guards/statementOfMeansGuard';
import {claimantIntentGuard} from 'routes/guards/claimantIntentGuard';
import {trialArrangementsGuard} from 'routes/guards/caseProgression/trialArragement/trialArrangementsGuard';
import {claimIssueTaskListGuard} from 'routes/guards/claimIssueTaskListGuard';
import {ErrorHandler} from 'modules/error';
import {isGAForLiPEnabled} from 'routes/guards/generalAplicationGuard';
import config = require('config');
import {trackHistory} from 'routes/guards/trackHistory';
import {OidcMiddleware} from 'modules/oidc';
import {AppSession} from 'models/AppRequest';
import {DraftStoreCliente2e, getRedisStoreForSessione2e} from 'modules/e2eConfiguration';
import { deleteGAGuard } from 'routes/guards/deleteGAGuard';
import {GaTrackHistory} from 'routes/guards/GaTrackHistory';
import {contactUsGuard} from 'routes/guards/contactUsGuard';
import {shareQueryConfirmationGuard} from 'routes/guards/shareQueryConfirmationGuard';
import {clearShareQuerySessionIfLeftJourney} from 'routes/guards/shareQueryConfirmationGuard';
import {mediationClaimantPhoneRedirectionGuard} from 'routes/guards/mediationClaimantPhoneRedirectionGuard';

const {Logger} = require('@hmcts/nodejs-logging');
const {setupDev} = require('./development');

const env = process.env.NODE_ENV || 'development';
const productionMode = env === 'production';
const developmentMode = env === 'development';
const e2eTestMode = env === 'e2eTest';
const cookieMaxAge = config.get<number>('cookieMaxAge');

export const app = express();
app.use(cookieParser());
app.use(setLanguage);
app.use(favicon(path.join(__dirname, 'public', 'assets', 'images', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));
app.locals.ENV = env;
I18Next.enableFor(app);

const logger = Logger.getLogger('app');

new PropertiesVolume().enableFor(app);
new AppInsights().enable();

if(e2eTestMode){
  logger.info('Creating new draftStoreClient e2e');
  new DraftStoreCliente2e(Logger.getLogger('draftStoreClient')).enableFor(app);
}else {
  logger.info('Creating new draftStoreClient');
  new DraftStoreClient(Logger.getLogger('draftStoreClient')).enableFor(app);
}

logger.info('Adding configuration for session store');
const sessionStore = e2eTestMode? getRedisStoreForSessione2e() : getRedisStoreForSession();

app.use(session({
  name: 'citizen-ui-session',
  store: sessionStore,
  secret: 'local',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    secure: productionMode,
    maxAge: cookieMaxAge,
    sameSite: 'lax',
  },
}));

app.use(setCaseReferenceCookie({secure: productionMode, maxAge: cookieMaxAge}));

app.enable('trust proxy');
new Nunjucks(developmentMode).enableFor(app);
new Helmet(config.get('security')).enableFor(app);
new HealthCheck().enableFor(app);

app.use(SIGN_OUT_URL, deleteGAGuard);

if(!e2eTestMode){
  new OidcMiddleware().enableFor(app);
}

if(e2eTestMode){
  app.get(TEST_SUPPORT_TOGGLE_FLAG_ENDPOINT, async (req, res, next) => {
    try {
      const key = req.params.key;
      const booleanValue: boolean = JSON.parse(req.params.value);
      await updateE2EKey(key, booleanValue);
      // Send a response back to the client
      res.status(200).json({ message: 'Flag updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error changing the flag', error });
    }
  });

  // Use your custom middleware to add the session information
  app.use((req, res, next) => {
    const session = ((req.session) as AppSession);
    session.user = {accessToken: 'someAccessToken', email: '', familyName: '', givenName: '', roles: [], id: 'someID'};
    next();
  });
}
app.use(STATEMENT_OF_MEANS_URL, statementOfMeansGuard);
app.use(BASE_CLAIMANT_RESPONSE_URL, claimantIntentGuard);
app.use([BASE_GENERAL_APPLICATION_URL, BASE_GENERAL_APPLICATION_RESPONSE_URL], isGAForLiPEnabled);
app.use(BASE_CLAIM_URL, claimIssueTaskListGuard);
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
  CLAIMANT_RESPONSE_CHECK_ANSWERS_URL,
  //QM
  QM_START_URL,
  QM_WHAT_DO_YOU_WANT_TO_DO_URL,
  QM_FOLLOW_UP_URL,
  QM_INFORMATION_URL,
  QM_VIEW_QUERY_URL,
  QM_CYA,
  QM_FOLLOW_UP_CYA,
  QM_FOLLOW_UP_MESSAGE,
  QUERY_MANAGEMENT_CREATE_QUERY,
  QM_SHARE_QUERY_CONFIRMATION,
  APPLICATION_TYPE_URL,
  GA_SUBMIT_OFFLINE,
  BREATHING_SPACE_INFO_URL,
], trackHistory);

app.use([
  QUERY_MANAGEMENT_CREATE_QUERY,
], shareQueryConfirmationGuard);

app.use(clearShareQuerySessionIfLeftJourney);

app.use([
  //GA
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL,
  GA_VIEW_APPLICATION_URL,
  APPLICATION_TYPE_URL,
  GA_AGREEMENT_FROM_OTHER_PARTY_URL,
  INFORM_OTHER_PARTIES_URL,
  GA_CLAIM_APPLICATION_COST_URL,
  GA_APPLICATION_COSTS_URL,
  GA_CLAIM_APPLICATION_COST_URL,
  GA_UPLOAD_N245_FORM_URL,
  GA_WANT_TO_UPLOAD_DOCUMENTS_URL,
  GA_UPLOAD_DOCUMENTS_URL,
  GA_HEARING_ARRANGEMENTS_GUIDANCE_URL,
  GA_HEARING_ARRANGEMENT_URL,
  GA_HEARING_CONTACT_DETAILS_URL,
  GA_UNAVAILABILITY_CONFIRMATION_URL,
  GA_UNAVAILABLE_HEARING_DATES_URL,
  GA_HEARING_SUPPORT_URL,
  PAYING_FOR_APPLICATION_URL,
  GA_CHECK_ANSWERS_URL,
  ORDER_JUDGE_URL,
  GA_REQUESTING_REASON_URL,
  GA_ADD_ANOTHER_APPLICATION_URL,
  GA_ASK_PROOF_OF_DEBT_PAYMENT_GUIDANCE_URL,
  GA_DEBT_PAYMENT_EVIDENCE_COSC_URL,
  GA_UPLOAD_DOCUMENTS_COSC_URL,
  GA_CHECK_YOUR_ANSWERS_COSC_URL,
  COSC_FINAL_PAYMENT_DATE_URL,
  REQUEST_MORE_TIME_URL,
  RESPONSE_DEADLINE_OPTIONS_URL,
  TYPES_OF_DOCUMENTS_URL,
  UPLOAD_YOUR_DOCUMENTS_URL,
], GaTrackHistory);

app.use([
  //GA response
  GA_RESPONSE_VIEW_APPLICATION_URL,
  GA_AGREE_TO_ORDER_URL,
  GA_RESPONDENT_AGREEMENT_URL,
  GA_RESPONSE_HEARING_ARRANGEMENT_URL,
  GA_RESPONSE_HEARING_CONTACT_DETAILS_URL,
  GA_RESPONSE_HEARING_SUPPORT_URL,
  GA_RESPONDENT_HEARING_PREFERENCE_URL,
  GA_RESPONDENT_UPLOAD_DOCUMENT_URL,
  GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT_URL,
  GA_UNAVAILABILITY_RESPONSE_CONFIRMATION_URL,
  GA_RESPONSE_UNAVAILABLE_HEARING_DATES_URL,
  GA_RESPONSE_CHECK_ANSWERS_URL,
], GaTrackHistory);

app.use([
  //GA upload documents
  GA_RESPOND_ADDITIONAL_INFO_URL,
  GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_URL,
  GA_UPLOAD_DOCUMENT_FOR_ADDITIONAL_INFO_CYA_URL,
  GA_UPLOAD_ADDITIONAL_DOCUMENTS_URL,
  GA_UPLOAD_ADDITIONAL_DOCUMENTS_CYA_URL,
  GA_PROVIDE_MORE_INFORMATION_URL,
  GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_URL,
  GA_UPLOAD_WRITTEN_REPRESENTATION_DOCS_CYA_URL,
  GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_URL,
  GA_UPLOAD_DOCUMENT_DIRECTIONS_ORDER_CYA_URL,
], GaTrackHistory);

if(env !== 'test') {
  app.use(contactUsGuard);
  app.use(MEDIATION_PHONE_CONFIRMATION_URL, mediationClaimantPhoneRedirectionGuard);
}
app.use(bodyParser.json({limit: '500mb'}));
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));

app.use((_req, res, next) => {
  res.setHeader(
    'Cache-Control',
    'no-cache, max-age=0, must-revalidate, no-store',
  );

  res.setHeader(
    'Access-Control-Allow-Origin',
    '*',
  );

  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );

  res.setHeader(
    'access-control-allow-methods',
    'GET,POST,OPTIONS,PUT,DELETE',
  );

  next();
});

const checkServiceAvailability = async (_req: express.Request, res: express.Response, next: express.NextFunction) => {
  const serviceShuttered = await isServiceShuttered();
  if (serviceShuttered) {
    logger.info(`service is shuttered... ${serviceShuttered}`);
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
