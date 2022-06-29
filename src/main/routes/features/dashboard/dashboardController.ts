import * as express from 'express';
import {CivilServiceClient} from '../../../../main/app/client/civilServiceClient';
import config from 'config';
import {DASHBOARD_URL} from '../../urls';
import {AppRequest} from 'models/AppRequest';
import {CivilClaimResponse} from 'common/models/civilClaimResponse';
import {DashboardClaimantItem} from 'models/dashboard/dashboardItem';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

function renderPage(res: express.Response, claimsAsClaimant: DashboardClaimantItem[], claimDraftSaved: boolean,
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

dashboardController.get(DASHBOARD_URL, async function (req, res) {
  const claimsAsClaimant : DashboardClaimantItem[] = await civilServiceClient.getClaimsForClaimant(<AppRequest>req);
  console.log(claimsAsClaimant);
  const claimsAsDefendant : CivilClaimResponse[]  = await civilServiceClient.retrieveByDefendantId(<AppRequest>req);
  const claimDraftSaved = false;
  const responseDraftSaved = false;
  const paginationArgumentClaimant: object = {};
  const paginationArgumentDefendant: object = {};
  renderPage(res, claimsAsClaimant, claimDraftSaved, claimsAsDefendant,responseDraftSaved, paginationArgumentClaimant, paginationArgumentDefendant);
});

export default dashboardController;
