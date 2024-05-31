import {
  DASHBOARD_CLAIMANT_URL,
  DEFENDANT_SUMMARY_URL, VIEW_ORDERS_AND_NOTICES_URL, VIEW_THE_JUDGMENT_URL,
} from 'routes/urls';
import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {getJudgementContent} from 'services/features/caseProgression/judgement/judgementService';

const viewTheJudgementController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
const judgementViewPath = 'features/caseProgression/view-the-judgement';

viewTheJudgementController.get(VIEW_THE_JUDGMENT_URL, (async (req:Request, res:Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);

    const dashboardUrl = claim.isClaimant()
      ? DASHBOARD_CLAIMANT_URL.replace(':id', claimId)
      : DEFENDANT_SUMMARY_URL.replace(':id', claimId);

    const judgementSections = getJudgementContent(claimId,claim, lang,dashboardUrl);

    res.render(judgementViewPath,
      {judgementSections,
        pageCaption: 'PAGES.DASHBOARD.JUDGMENTS.THE_JUDGMENT',
        pageTitle: 'PAGES.DASHBOARD.JUDGMENTS.VIEW_THE_JUDGMENT',
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

export default viewTheJudgementController;
