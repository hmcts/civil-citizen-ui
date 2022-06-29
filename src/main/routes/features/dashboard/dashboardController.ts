import * as express from 'express';
import {CivilServiceClient} from '../../../../main/app/client/civilServiceClient';
import {Claim} from '../../../common/models/claim';
import config from 'config';
import {DASHBOARD_URL} from '../../urls';
import {AppRequest} from '../../../common/models/AppRequest';
import {DashboardDefendantItem} from '../../../common/models/dashboard/dashboardItem';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

function renderPage(res: express.Response, claimsAsClaimant: Claim[], claimDraftSaved: boolean,
  claimsAsDefendant: DashboardDefendantItem[], responseDraftSaved: boolean,
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
  const claimsAsClaimant : Claim[] = [];
  const claimsAsDefendant : DashboardDefendantItem[] = await civilServiceClient.getClaimsForDefendant(<AppRequest>req);
  const claimDraftSaved = false;
  const responseDraftSaved = false;
  const paginationArgumentClaimant: object = {};
  const paginationArgumentDefendant: object = {};
  renderPage(res, claimsAsClaimant, claimDraftSaved, claimsAsDefendant,responseDraftSaved, paginationArgumentClaimant, paginationArgumentDefendant);
});

export default dashboardController;
