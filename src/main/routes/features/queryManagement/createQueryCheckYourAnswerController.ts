import {NextFunction, RequestHandler, Response, Router} from 'express';
import {AppRequest} from 'models/AppRequest';
import {CivilServiceClient} from 'client/civilServiceClient';
import config from 'config';
import {getClaimById} from 'modules/utilityService';
import {BACK_URL, QM_CYA, QM_FOLLOW_UP_CYA} from 'routes/urls';
import {getCancelUrl} from 'services/features/queryManagement/queryManagementService';
import {
  CivilServiceDebugError,
  getSummarySections,
  submitCorruptedQueryFromCheckYourAnswers,
} from 'services/features/queryManagement/createQueryCheckYourAnswerService';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {SummaryRow} from 'models/summaryList/summaryList';

const viewPath = 'features/queryManagement/createQueryCheckYourAnswer.njk';
const createQueryCheckYourAnswerController = Router();

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const isFollowUp = (url: string): boolean => {
  return url.includes('follow-up-query-cya') ;
};

const formatDebugErrorForView = (civilServiceDebugError?: CivilServiceDebugError) => {
  if (!civilServiceDebugError) {
    return undefined;
  }

  return {
    ...civilServiceDebugError,
    requestBodyJson: JSON.stringify(civilServiceDebugError.requestBody, null, 2),
    responseBodyJson: civilServiceDebugError.responseBody !== undefined
      ? JSON.stringify(civilServiceDebugError.responseBody, null, 2)
      : 'No response body',
  };
};

const renderCheckYourAnswersView = (
  res: Response,
  options: {
    summaryRows: SummaryRow[];
    cancelUrl: string;
    title: {caption: string; heading: string};
    civilServiceDebugError?: CivilServiceDebugError;
  },
): void => {
  res.render(viewPath, {
    summaryRows: options.summaryRows,
    backLinkUrl: BACK_URL,
    cancelUrl: options.cancelUrl,
    title: options.title,
    civilServiceDebugError: formatDebugErrorForView(options.civilServiceDebugError),
  });
};

createQueryCheckYourAnswerController.get([QM_CYA, QM_FOLLOW_UP_CYA], (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const isFollowUpUrl = isFollowUp(req.originalUrl);
    const title = {
      caption: isFollowUpUrl? 'PAGES.QM.HEADINGS.FOLLOW_UP_CAPTION':'PAGES.QM.HEADINGS.CAPTION',
      heading: isFollowUpUrl? 'PAGES.QM.HEADINGS.FOLLOW_UP_HEADING':'PAGES.QM.SEND_MESSAGE_CYA.HEADING',
    };
    const queryId = getRouteParam(req, 'queryId');
    const claimId = getRouteParam(req, 'id');
    const claim = await getClaimById(claimId, req, true);
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    renderCheckYourAnswersView(res, {
      summaryRows: getSummarySections(claimId, claim, lang, isFollowUpUrl, queryId),
      cancelUrl: getCancelUrl(claimId),
      title,
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

createQueryCheckYourAnswerController.post([QM_CYA, QM_FOLLOW_UP_CYA], async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const isFollowUpUrl = isFollowUp(req.originalUrl);
    const claimId = getRouteParam(req, 'id');
    const queryId = getRouteParam(req, 'queryId');
    const claim = await getClaimById(claimId, req, true);
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const title = {
      caption: isFollowUpUrl? 'PAGES.QM.HEADINGS.FOLLOW_UP_CAPTION':'PAGES.QM.HEADINGS.CAPTION',
      heading: isFollowUpUrl? 'PAGES.QM.HEADINGS.FOLLOW_UP_HEADING':'PAGES.QM.SEND_MESSAGE_CYA.HEADING',
    };
    const updatedClaim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);

    const civilServiceDebugError = await submitCorruptedQueryFromCheckYourAnswers(
      claim,
      updatedClaim,
      req,
      isFollowUpUrl,
    );
    return renderCheckYourAnswersView(res, {
      summaryRows: getSummarySections(claimId, claim, lang, isFollowUpUrl, queryId),
      cancelUrl: getCancelUrl(claimId),
      title,
      civilServiceDebugError,
    });
  } catch (error) {
    next(error);
  }
});
export default createQueryCheckYourAnswerController;
