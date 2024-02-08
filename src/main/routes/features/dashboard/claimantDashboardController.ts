import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import config from 'config';
import {DASHBOARD_CLAIMANT_URL} from '../../urls';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'common/models/AppRequest';
import {getDashboardForm, getNotifications} from 'services/dashboard/dashboardService';
import {Claim} from 'models/claim';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';

const claimantDashboardViewPath = 'features/dashboard/claim-summary-redesign';
const paymentInformation = 'paymentInformation';
const hearing = 'hearing';

const claimantDashboardController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

claimantDashboardController.get(DASHBOARD_CLAIMANT_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim: Claim = new Claim();
    const redisClaim: Claim = await getCaseDataFromStore(generateRedisKey(<AppRequest>req),true);
    const caseData = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    caseData.caseProgression[hearing]= {[paymentInformation]: redisClaim.caseProgression?.hearing?.paymentInformation};
    Object.assign(claim, caseData);
    const dashboardNotifications = await getNotifications(claimId, claim, lang);
    const dashboardTaskList = await getDashboardForm(claim,claimId);
    res.render(claimantDashboardViewPath, {claim, claimId, dashboardTaskList, dashboardNotifications});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default claimantDashboardController;
