import {RequestHandler, Response, Router} from 'express';

import config from 'config';
import {DASHBOARD_URL} from '../../urls';
import {AppRequest, UserDetails} from 'models/AppRequest';
import {DashboardClaimantItem, DashboardDefendantItem} from 'common/models/dashboard/dashboardItem';
import {CivilServiceClient} from 'client/civilServiceClient';
import {DraftClaimData, getDraftClaimData} from 'services/dashboard/draftClaimService';
import { buildPagination } from 'services/features/dashboard/claimPaginationService';
import { DashboardClaimantResponse, DashboardDefendantResponse } from 'common/models/dashboard/dashboarddefendantresponse';
import {GeneralApplicationClient} from 'client/generalApplicationClient';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
const generalApplicationApiBaseUrl = config.get<string>('services.generalApplication.url');
const generalApplicationClient: GeneralApplicationClient = new GeneralApplicationClient(generalApplicationApiBaseUrl);

function renderPage(res: Response, claimsAsClaimant: DashboardClaimantItem[], claimDraftSaved: DashboardClaimantItem,
  claimsAsDefendant: DashboardDefendantItem[], responseDraftSaved: boolean, draftClaimUrl: string,
  paginationArgumentClaimant: object, paginationArgumentDefendant: object, lang: string, applications: ApplicationResponse[] ): void {

  res.render('features/dashboard/dashboard', {
    claimsAsClaimant,
    claimDraftSaved,
    claimsAsDefendant,
    responseDraftSaved,
    paginationArgumentClaimant,
    paginationArgumentDefendant,
    lang,
    newOcmcClaimUrl: draftClaimUrl,
    applications,
  });
}

const dashboardController = Router();

dashboardController.get(DASHBOARD_URL, (async function (req, res, next) {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const appRequest = <AppRequest> req;
  const user: UserDetails = appRequest.session.user;
  try{
    const draftClaimData: DraftClaimData = await getDraftClaimData(user?.accessToken, user?.id);
    const claimsAsClaimant: DashboardClaimantResponse = await civilServiceClient.getClaimsForClaimant(appRequest);
    const claimDraftSaved = draftClaimData?.draftClaim;
    const claimsAsDefendant: DashboardDefendantResponse = await civilServiceClient.getClaimsForDefendant(appRequest);
    const claimantPage = req.query?.claimantPage ? 'claimantPage=' + req.query?.claimantPage : '';
    const defendantPage = req.query?.defendantPage ? 'defendantPage=' + req.query?.defendantPage : '';
    const claimsAsDefendantPaginationList = buildPagination(claimsAsDefendant.totalPages, req.query?.defendantPage as string, lang, 'defendantPage', claimantPage);
    const responseDraftSaved = false;
    const paginationArgumentClaimant = buildPagination(claimsAsClaimant.totalPages, req.query?.claimantPage as string, lang, 'claimantPage', defendantPage);
    const draftClaimUrl = draftClaimData?.claimCreationUrl;
    const applications: ApplicationResponse[] = await generalApplicationClient.getApplications(appRequest);
    renderPage(res, claimsAsClaimant.claims, claimDraftSaved, claimsAsDefendant.claims, responseDraftSaved, draftClaimUrl, paginationArgumentClaimant, claimsAsDefendantPaginationList, lang, applications);
  }catch(error){
    next(error);
  }
}) as RequestHandler);

export default dashboardController;
