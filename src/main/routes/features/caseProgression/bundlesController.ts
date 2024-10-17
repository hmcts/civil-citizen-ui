import {
  BUNDLES_URL,
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL,
} from 'routes/urls';
import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {getBundlesContent} from 'services/features/caseProgression/bundles/bundlesService';
import {caseNumberPrettify} from 'common/utils/stringUtils';

const bundlesController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
const bundlesViewPath = 'features/caseProgression/bundles';

bundlesController.get(BUNDLES_URL, (async (req:Request, res:Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);

    const dashboardUrl = claim.isClaimant()
      ? DASHBOARD_CLAIMANT_URL.replace(':id', claimId)
      : DEFENDANT_SUMMARY_URL.replace(':id', claimId);

    const bundleSections = getBundlesContent(claimId, claim, lang);

    res.render(bundlesViewPath,
      {bundleSections,
        pageCaption: 'PAGES.DASHBOARD.HEARINGS.HEARING',
        pageTitle: 'PAGES.DASHBOARD.HEARINGS.VIEW_BUNDLE',
        claimId: caseNumberPrettify(claimId),
        claimAmount: claim.totalClaimAmount,
        dashboardUrl: dashboardUrl,
      },
    );
  } catch (error) {
    next(error);
  }
})as RequestHandler);

export default bundlesController;
