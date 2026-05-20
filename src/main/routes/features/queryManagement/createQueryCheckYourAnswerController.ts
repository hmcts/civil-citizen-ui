import {NextFunction, RequestHandler, Response, Router} from 'express';
import {AppRequest} from 'models/AppRequest';
import {CivilServiceClient} from 'client/civilServiceClient';
import config from 'config';
import {getClaimById} from 'modules/utilityService';
import {Claim} from 'models/claim';
import {BACK_URL, QM_CONFIRMATION_URL, QM_CYA, QM_FOLLOW_UP_CYA} from 'routes/urls';
import {getCancelUrl, saveQueryManagement} from 'services/features/queryManagement/queryManagementService';
import {createQuery, getSummarySections} from 'services/features/queryManagement/createQueryCheckYourAnswerService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {
  CallbackErrorViewData,
  callbackErrorRenderProps,
  handleCallbackValidationErrorOrNext,
} from 'client/common/error/handleCallbackValidationError';
import {throwMockCallbackValidation422IfEnabled} from 'app/mocks/callbackValidation422Mock';

const viewPath = 'features/queryManagement/createQueryCheckYourAnswer.njk';
const createQueryCheckYourAnswerController = Router();

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const isFollowUp = (url: string): boolean => {
  return url.includes('follow-up-query-cya') ;
};

const renderCheckYourAnswerView = (
  res: Response,
  claimId: string,
  claim: Claim,
  lang: string,
  isFollowUpUrl: boolean,
  queryId: string,
  callbackErrorViewData?: CallbackErrorViewData,
) => {
  const title = {
    caption: isFollowUpUrl ? 'PAGES.QM.HEADINGS.FOLLOW_UP_CAPTION' : 'PAGES.QM.HEADINGS.CAPTION',
    heading: isFollowUpUrl ? 'PAGES.QM.HEADINGS.FOLLOW_UP_HEADING' : 'PAGES.QM.SEND_MESSAGE_CYA.HEADING',
  };
  res.render(viewPath, {
    summaryRows: getSummarySections(claimId, claim, lang, isFollowUpUrl, queryId),
    backLinkUrl: BACK_URL,
    cancelUrl: getCancelUrl(claimId),
    title,
    ...callbackErrorRenderProps(callbackErrorViewData),
  });
};

createQueryCheckYourAnswerController.get([QM_CYA, QM_FOLLOW_UP_CYA], (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const isFollowUpUrl = isFollowUp(req.originalUrl);
    const queryId = getRouteParam(req, 'queryId');
    const claimId = getRouteParam(req, 'id');
    const claim = await getClaimById(claimId, req, true);
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    renderCheckYourAnswerView(res, claimId, claim, lang, isFollowUpUrl, queryId);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

createQueryCheckYourAnswerController.post([QM_CYA, QM_FOLLOW_UP_CYA], async (req: AppRequest, res: Response, next: NextFunction) => {
  const isFollowUpUrl = isFollowUp(req.originalUrl);
  const claimId = getRouteParam(req, 'id');
  const queryId = getRouteParam(req, 'queryId');
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  let claim: Claim;
  try {
    claim = await getClaimById(claimId, req, true);
    throwMockCallbackValidation422IfEnabled(req);
    const updatedClaim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    await createQuery(claim, updatedClaim, req, isFollowUpUrl);
    const propertyName = isFollowUpUrl ? 'sendFollowUpQuery' : 'createQuery';
    await saveQueryManagement(claimId, null, propertyName, req);
    delete req.session.qmShareConfirmed;
    res.redirect(constructResponseUrlWithIdParams(claimId, QM_CONFIRMATION_URL));
  } catch (error) {
    await handleCallbackValidationErrorOrNext(error, res, next, (viewData) =>
      renderCheckYourAnswerView(res, claimId, claim, lang, isFollowUpUrl, queryId, viewData));
  }
});
export default createQueryCheckYourAnswerController;
