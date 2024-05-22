import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {GA_REQUESTING_REASON_URL} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {selectedApplicationType} from 'common/models/generalApplication/applicationType';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {RequestingReason} from 'models/generalApplication/requestingReason';
import {saveRequestingReason} from 'services/features/generalApplication/generalApplicationService';
import {buildRequestingReasonPageContent} from 'services/features/generalApplication/requestingReasonPageBuilder';

const requestingReasonController = Router();
const viewPath = 'features/generalApplication/requesting-reason';
const cancelUrl = 'test'; // TODO: add url
const backLinkUrl = 'test'; // TODO: add url

requestingReasonController.get(GA_REQUESTING_REASON_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const queryRequestingReasonIndex = req.query.index;
    const requestingReasonIndex = queryRequestingReasonIndex ? parseInt(queryRequestingReasonIndex as string) : -1;
    const applicationTypeOption  = requestingReasonIndex >= 0 && requestingReasonIndex < claim.generalApplication?.requestingReasons?.length
      ? claim.generalApplication?.applicationTypes[requestingReasonIndex]?.option
      : claim.generalApplication?.applicationTypes[claim.generalApplication.applicationTypes.length - 1]?.option;
    const requestingReasonText = requestingReasonIndex >= 0 && requestingReasonIndex < claim.generalApplication?.requestingReasons?.length
      ? claim.generalApplication.requestingReasons[requestingReasonIndex].text
      : undefined;
    const requestingReason = new RequestingReason(requestingReasonText);
    const applicationType = selectedApplicationType[applicationTypeOption];
    const contentList = buildRequestingReasonPageContent(claim.generalApplication?.applicationTypes[claim.generalApplication.applicationTypes.length - 1]?.option, lng);
    const form = new GenericForm(requestingReason);
    res.render(viewPath, {
      form,
      cancelUrl,
      backLinkUrl,
      applicationType,
      contentList,
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

requestingReasonController.post(GA_REQUESTING_REASON_URL, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const redisKey = generateRedisKey(<AppRequest>req);
    const requestingReason = new RequestingReason(req.body.text);
    const queryRequestingReasonIndex = req.query.index;
    const requestingReasonIndex = queryRequestingReasonIndex ? parseInt(queryRequestingReasonIndex as string) : -1;
    const applicationTypeOption  = requestingReasonIndex >= 0 && requestingReasonIndex < claim.generalApplication?.requestingReasons?.length
      ? claim.generalApplication?.applicationTypes[requestingReasonIndex]?.option
      : claim.generalApplication?.applicationTypes[claim.generalApplication.applicationTypes.length - 1]?.option;
    const applicationType = selectedApplicationType[applicationTypeOption];
    const contentList =
      buildRequestingReasonPageContent(claim.generalApplication?.applicationTypes[claim.generalApplication.applicationTypes.length - 1]?.option, lng);

    const form = new GenericForm(requestingReason);
    await form.validate();
    if (form.hasErrors()) {
      res.render(viewPath, {
        form,
        cancelUrl,
        backLinkUrl,
        applicationType,
        contentList,
      });
    } else {
      await saveRequestingReason(redisKey, requestingReason, requestingReasonIndex);
      res.redirect('test'); // TODO: add url
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default requestingReasonController;
