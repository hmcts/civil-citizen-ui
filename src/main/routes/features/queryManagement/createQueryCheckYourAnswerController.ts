import {NextFunction, RequestHandler, Response, Router} from 'express';
import {AppRequest} from 'models/AppRequest';
import {CivilServiceClient} from 'client/civilServiceClient';
import config from 'config';
import {getClaimById} from 'modules/utilityService';
import {BACK_URL, QM_CONFIRMATION_URL, QM_CYA, QM_FOLLOW_UP_CYA, QM_FOLLOW_UP_MESSAGE, QUERY_MANAGEMENT_CREATE_QUERY} from 'routes/urls';
import {getCancelUrl, saveQueryManagement} from 'services/features/queryManagement/queryManagementService';
import {createQuery, getSummarySections} from 'services/features/queryManagement/createQueryCheckYourAnswerService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getRouteParam} from 'common/utils/routeParamUtils';

const viewPath = 'features/queryManagement/createQueryCheckYourAnswer.njk';
const createQueryCheckYourAnswerController = Router();

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const isFollowUp = (url: string): boolean => {
  return url.includes('follow-up-query-cya') ;
};

const getDraftStartUrl = (claimId: string, isFollowUpQuery: boolean, queryId: string): string => {
  if (isFollowUpQuery) {
    return constructResponseUrlWithIdParams(claimId, QM_FOLLOW_UP_MESSAGE).replace(':queryId', queryId);
  }
  return constructResponseUrlWithIdParams(claimId, QUERY_MANAGEMENT_CREATE_QUERY);
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
    const summaryRows = getSummarySections(claimId, claim, lang, isFollowUpUrl, queryId);
    if (summaryRows === null) {
      return res.redirect(getDraftStartUrl(claimId, isFollowUpUrl, queryId));
    }
    const backLinkUrl = BACK_URL;
    const cancelUrl = getCancelUrl(claimId);
    res.render(viewPath, {
      summaryRows,
      backLinkUrl,
      cancelUrl,
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
    const draft = isFollowUpUrl ? claim.queryManagement?.sendFollowUpQuery : claim.queryManagement?.createQuery;
    if (!draft) {
      return res.redirect(getDraftStartUrl(claimId, isFollowUpUrl, queryId));
    }
    const updatedClaim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    await createQuery(claim, updatedClaim, req, isFollowUpUrl);
    const propertyName = isFollowUpUrl ? 'sendFollowUpQuery' : 'createQuery';
    //save the information
    await saveQueryManagement(claimId, null, propertyName, req);
    delete req.session.qmShareConfirmed;
    res.redirect(constructResponseUrlWithIdParams(claimId, QM_CONFIRMATION_URL));
  } catch (error) {
    next(error);
  }
});
export default createQueryCheckYourAnswerController;
