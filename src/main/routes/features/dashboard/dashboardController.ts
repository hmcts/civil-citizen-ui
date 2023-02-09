import {Response, Router} from 'express';

import config from 'config';
import {DASHBOARD_URL} from '../../urls';
import {AppRequest, UserDetails} from 'models/AppRequest';
import {getOcmcDraftClaims} from '../../../app/client/legacyDraftStoreClient';
import {DashboardClaimantItem, DashboardDefendantItem} from '../../../common/models/dashboard/dashboardItem';
import {getClaimsForClaimant, getClaimsForDefendant} from 'services/features/dashboard/dashboardService';

const ocmcBaseUrl = config.get<string>('services.cmc.url');

function renderPage(res: Response, claimsAsClaimant: DashboardClaimantItem[], claimDraftSaved: DashboardClaimantItem,
  claimsAsDefendant: DashboardDefendantItem[], responseDraftSaved: boolean,
  paginationArgumentClaimant: object, paginationArgumentDefendant: object): void {
  res.render('features/dashboard/dashboard', {
    claimsAsClaimant,
    claimDraftSaved,
    claimsAsDefendant,
    responseDraftSaved,
    paginationArgumentClaimant,
    paginationArgumentDefendant,
    newOcmcClaimUrl: `${ocmcBaseUrl}/eligibility`,
  });
}

const dashboardController = Router();

dashboardController.get(DASHBOARD_URL, async function (req, res) {
  const appRequest = <AppRequest> req;
  const user: UserDetails = appRequest.session.user;
  const claimsAsClaimant : DashboardClaimantItem[] = await getClaimsForClaimant(req);
  const claimsAsDefendant : DashboardDefendantItem[] = await getClaimsForDefendant(req);
  const claimDraftSaved = await getOcmcDraftClaims(user?.accessToken);
  const responseDraftSaved = false;
  const paginationArgumentClaimant: object = {};
  const paginationArgumentDefendant: object = {};
  renderPage(res, claimsAsClaimant, claimDraftSaved, claimsAsDefendant, responseDraftSaved, paginationArgumentClaimant, paginationArgumentDefendant);
});

export default dashboardController;
