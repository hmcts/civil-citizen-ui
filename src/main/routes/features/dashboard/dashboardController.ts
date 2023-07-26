import {Response, Router} from 'express';

import config from 'config';
import {DASHBOARD_URL} from '../../urls';
import {AppRequest, UserDetails} from 'models/AppRequest';
import {getOcmcDraftClaims} from '../../../app/client/legacyDraftStoreClient';
import {DashboardClaimantItem, DashboardDefendantItem} from '../../../common/models/dashboard/dashboardItem';
import {CivilServiceClient} from 'client/civilServiceClient';
import { buildPagination } from 'services/features/dashboard/claimPaginationService';
import { DashboardDefendantResponse } from 'common/models/dashboard/dashboarddefendantresponse';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
const ocmcBaseUrl = config.get<string>('services.cmc.url');

function renderPage(res: Response, claimsAsClaimant: DashboardClaimantItem[], claimDraftSaved: DashboardClaimantItem,
  claimsAsDefendant: DashboardDefendantItem[], responseDraftSaved: boolean,
  paginationArgumentClaimant: object, paginationArgumentDefendant: object, lang: string | unknown): void {
  res.render('features/dashboard/dashboard', {
    claimsAsClaimant,
    claimDraftSaved,
    claimsAsDefendant,
    responseDraftSaved,
    paginationArgumentClaimant,
    paginationArgumentDefendant,
    lang,
    newOcmcClaimUrl: `${ocmcBaseUrl}/eligibility`,
  });
}

const dashboardController = Router();

dashboardController.get(DASHBOARD_URL, async function (req, res, next) {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const appRequest = <AppRequest> req;
  const user: UserDetails = appRequest.session.user;
  try{
    const claimsAsClaimant : DashboardClaimantItem[] = await civilServiceClient.getClaimsForClaimant(appRequest);
    const claimsAsDefendant: DashboardDefendantResponse = await civilServiceClient.getClaimsForDefendant(appRequest);
    const claimsAsDefendantPaginationList = buildPagination(claimsAsDefendant.totalPages, req.query?.page as string, lang);
    const claimDraftSaved = await getOcmcDraftClaims(user?.accessToken);
    const responseDraftSaved = false;
    const paginationArgumentClaimant: object = {};
    renderPage(res, claimsAsClaimant, claimDraftSaved, claimsAsDefendant.claims, responseDraftSaved, paginationArgumentClaimant, claimsAsDefendantPaginationList, lang);
  }catch(error){
    next(error);
  }
});

export default dashboardController;
