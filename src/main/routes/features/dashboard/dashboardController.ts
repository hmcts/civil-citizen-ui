import {Response, Router} from 'express';

import config from 'config';
import {DASHBOARD_URL} from '../../urls';
import {AppRequest, UserDetails} from 'models/AppRequest';
import {DashboardClaimantItem, DashboardDefendantItem} from 'common/models/dashboard/dashboardItem';
import {CivilServiceClient} from 'client/civilServiceClient';
import {buildPaginationData} from 'services/features/dashboard/claimPaginationService';
import {createDraftClaimUrl, getDraftClaim} from 'services/dashboard/draftClaimService';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

async function renderPage(res: Response, claimsAsClaimant: DashboardClaimantItem[], claimDraftSaved: DashboardClaimantItem,
  claimsAsDefendant: DashboardDefendantItem[], responseDraftSaved: boolean,
  paginationArgumentClaimant: object, paginationArgumentDefendant: object, lang: string | unknown): Promise<void> {
  const draftClaimUrl = await createDraftClaimUrl()
  res.render('features/dashboard/dashboard', {
    claimsAsClaimant,
    claimDraftSaved,
    claimsAsDefendant,
    responseDraftSaved,
    paginationArgumentClaimant,
    paginationArgumentDefendant,
    lang,
    newOcmcClaimUrl: draftClaimUrl,
  });
}

const dashboardController = Router();

dashboardController.get(DASHBOARD_URL, async function (req, res, next) {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const appRequest = <AppRequest> req;
  const user: UserDetails = appRequest.session.user;
  try{
    const claimsAsClaimant : DashboardClaimantItem[] = await civilServiceClient.getClaimsForClaimant(appRequest);
    const claimsAsDefendant: DashboardDefendantItem[] = await civilServiceClient.getClaimsForDefendant(appRequest);
    const claimsAsDefendantPaginationData = buildPaginationData(claimsAsDefendant, req.query?.page as string, lang);
    const claimDraftSaved = await getDraftClaim(user?.accessToken);
    const responseDraftSaved = false;
    const paginationArgumentClaimant: object = {};
    const paginationArgumentDefendant: object = claimsAsDefendantPaginationData.paginationArguments;
    await renderPage(res, claimsAsClaimant, claimDraftSaved, claimsAsDefendantPaginationData.paginatedClaims, responseDraftSaved, paginationArgumentClaimant, paginationArgumentDefendant, lang);
  }catch(error){
    next(error);
  }
});

export default dashboardController;
