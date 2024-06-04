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
    const requestingReason = new RequestingReason(claim.generalApplication?.requestingReason?.text);
    const applicationType = selectedApplicationType[claim.generalApplication?.applicationType?.option];
    const contentList = buildRequestingReasonPageContent(claim.generalApplication?.applicationType?.option, lng);
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
    const contentList = buildRequestingReasonPageContent(claim.generalApplication?.applicationType?.option, lng);
    const applicationType = selectedApplicationType[claim.generalApplication?.applicationType?.option];

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
      await saveRequestingReason(redisKey, requestingReason);
      res.redirect('test'); // TODO: add url
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default requestingReasonController;
