import * as express from 'express';
import {CivilServiceClient} from '../../../app/client/civilServiceClient';
import {Claim} from 'models/claim';
import config from 'config';
import {DASHBOARD_URL} from '../../urls';
import {AppRequest, UserDetails} from 'models/AppRequest';
import {CivilClaimResponse} from 'common/models/civilClaimResponse';
import {getOcmcDraftClaims} from '../../../app/client/legacyDraftStoreClient';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('dashboardController');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

function renderPage(res: express.Response, claimsAsClaimant: Claim[], claimDraftSaved: boolean,
  claimsAsDefendant: CivilClaimResponse[], responseDraftSaved: boolean,
  paginationArgumentClaimant: object, paginationArgumentDefendant: object): void {

  res.render('features/dashboard/dashboard', {
    claimsAsClaimant: claimsAsClaimant,
    claimDraftSaved: claimDraftSaved,
    claimsAsDefendant: claimsAsDefendant,
    responseDraftSaved: responseDraftSaved,
    paginationArgumentClaimant: paginationArgumentClaimant,
    paginationArgumentDefendant: paginationArgumentDefendant,
  });
}

const dashboardController = express.Router();

dashboardController.get(DASHBOARD_URL, async function (req: AppRequest, res) {
  const user: UserDetails = req.session.user;
  /*This is a call to validate integration with legacy draft-store. This will have to be refined in the future
  to display the draft claims on the dashboard*/
  logger.info('About to call getOcmcDraftClaims()...');
  await getOcmcDraftClaims(user.accessToken);
  logger.info('getOcmcDraftClaims() called successfully.');

  const claimsAsClaimant: Claim[] = [];
  const claimsAsDefendant: CivilClaimResponse[] = await civilServiceClient.retrieveByDefendantId(req);
  const claimDraftSaved = false;
  const responseDraftSaved = false;
  const paginationArgumentClaimant: object = {};
  const paginationArgumentDefendant: object = {};
  renderPage(res, claimsAsClaimant, claimDraftSaved, claimsAsDefendant, responseDraftSaved, paginationArgumentClaimant, paginationArgumentDefendant);
});

export default dashboardController;
