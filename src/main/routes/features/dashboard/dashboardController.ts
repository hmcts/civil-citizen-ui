import * as express from 'express';
import {CivilServiceClient} from '../../../../main/app/client/civilServiceClient';
import {Claim} from 'models/claim';
import config from 'config';
import {DASHBOARD_URL} from '../../urls';
import {AppRequest} from 'models/AppRequest';
import {CivilClaimResponse} from 'common/models/civilClaimResponse';
import {DashboardDefendantItem} from "models/dashboard/dashboardItem";

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

function renderPage(res: express.Response, claimsAsClaimant: Claim[], claimDraftSaved: boolean,
  claimsAsDefendant: CivilClaimResponse[], responseDraftSaved: boolean,
  paginationArgumentClaimant: object, paginationArgumentDefendant: object, ocmcClaimsAsDefendant: DashboardDefendantItem[]): void {

  res.render('features/dashboard/dashboard', {
    claimsAsClaimant: claimsAsClaimant,
    claimDraftSaved: claimDraftSaved,
    claimsAsDefendant: claimsAsDefendant,
    responseDraftSaved: responseDraftSaved,
    paginationArgumentClaimant: paginationArgumentClaimant,
    paginationArgumentDefendant: paginationArgumentDefendant,
    ocmcClaimsAsDefendant: ocmcClaimsAsDefendant,
  });
}

const dashboardController = express.Router();

dashboardController.get(DASHBOARD_URL, async function (req, res) {
  const claimsAsClaimant : Claim[] = [];
  const claimsAsDefendant : CivilClaimResponse[]  = await civilServiceClient.retrieveByDefendantId(<AppRequest>req);
  const ocmcClaimsAsDefendant : DashboardDefendantItem[] = await civilServiceClient.getClaimsForDefendant(<AppRequest>req);
  const claimDraftSaved = false;
  const responseDraftSaved = false;
  const paginationArgumentClaimant: object = {};
  const paginationArgumentDefendant: object = {};
  renderPage(res, claimsAsClaimant, claimDraftSaved, claimsAsDefendant,responseDraftSaved, paginationArgumentClaimant, paginationArgumentDefendant, ocmcClaimsAsDefendant);
});

export default dashboardController;
