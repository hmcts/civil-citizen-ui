import {
  VIEW_THE_HEARING_URL,
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL, VIEW_ORDERS_AND_NOTICES_URL,
} from 'routes/urls';
import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {getHearingContent} from 'services/features/caseProgression/hearing/hearingService';

const viewTheHearingController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
const hearingViewPath = 'features/caseProgression/view-the-hearing';

viewTheHearingController.get(VIEW_THE_HEARING_URL, (async (req:Request, res:Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);

    const dashboardUrl = claim.isClaimant()
      ? DASHBOARD_CLAIMANT_URL.replace(':id', claimId)
      : DEFENDANT_SUMMARY_URL.replace(':id', claimId);

    const hearingSections = getHearingContent(claimId,claim, lang,dashboardUrl);

    res.render(hearingViewPath,
      {hearingSections,
        pageCaption: 'PAGES.DASHBOARD.HEARINGS.HEARING',
        pageTitle: 'PAGES.DASHBOARD.HEARINGS.VIEW_THE_HEARING',
        link: VIEW_ORDERS_AND_NOTICES_URL.replace(':id', claimId),
        claimId: caseNumberPrettify(claimId),
        claimAmount: claim.totalClaimAmount,
        dashboardUrl: dashboardUrl,
      },
    );
  } catch (error) {
    next(error);
  }
})as RequestHandler);

export default viewTheHearingController;
