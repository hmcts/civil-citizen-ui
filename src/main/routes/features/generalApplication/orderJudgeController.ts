
import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {ORDER_JUDGE_URL} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {selectedApplicationType} from 'common/models/generalApplication/applicationType';
import {getCancelUrl, saveOrderJudge} from 'services/features/generalApplication/generalApplicationService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import {OrderJudge} from 'common/models/generalApplication/orderJudge';
import {buildPageContent} from 'services/features/generalApplication/orderJudgePageBuilder';
import {orderJudgeGuard} from 'routes/guards/orderJudgeGuard';

const orderJudgeController = Router();
const viewPath = 'features/generalApplication/order-judge';
const backLinkUrl = 'test'; // TODO: add url

orderJudgeController.get(ORDER_JUDGE_URL, [orderJudgeGuard], (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const cancelUrl = await getCancelUrl(claimId, claim);
    const queryOrderJudgeIndex = req.query.index;
    const orderJudgeIndex = queryOrderJudgeIndex ? parseInt(queryOrderJudgeIndex as string) : -1;
    const applicationTypeOption  = orderJudgeIndex >= 0 && orderJudgeIndex < claim.generalApplication?.orderJudges?.length
      ? claim.generalApplication?.applicationTypes[orderJudgeIndex]?.option
      : claim.generalApplication?.applicationTypes[claim.generalApplication.applicationTypes.length - 1]?.option;
    const orderJudgeText = orderJudgeIndex >= 0 && orderJudgeIndex < claim.generalApplication?.orderJudges?.length
      ? claim.generalApplication.orderJudges[orderJudgeIndex].text
      : undefined;
    const orderJudge = new OrderJudge(orderJudgeText);
    const applicationType = selectedApplicationType[applicationTypeOption];
    const {contentList, hintText} = buildPageContent(claim.generalApplication?.applicationTypes[claim.generalApplication.applicationTypes.length - 1]?.option, lng);
    const form = new GenericForm(orderJudge);
    res.render(viewPath, {
      form,
      cancelUrl,
      backLinkUrl,
      applicationType,
      contentList,
      hintText: orderJudge.text ? orderJudge.text : hintText,
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

orderJudgeController.post(ORDER_JUDGE_URL, [orderJudgeGuard],  (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const cancelUrl = await getCancelUrl(claimId, claim);
    const redisKey = generateRedisKey(<AppRequest>req);
    const orderJudge = new OrderJudge(req.body.text);
    const queryOrderJudgeIndex = req.query.index;
    const orderJudgeIndex = queryOrderJudgeIndex ? parseInt(queryOrderJudgeIndex as string) : -1;
    const applicationTypeOption  = orderJudgeIndex >= 0 && orderJudgeIndex < claim.generalApplication?.orderJudges?.length
      ? claim.generalApplication?.applicationTypes[orderJudgeIndex]?.option
      : claim.generalApplication?.applicationTypes[claim.generalApplication.applicationTypes.length - 1]?.option;
    const applicationType = selectedApplicationType[applicationTypeOption];
    const {contentList, hintText} = buildPageContent(applicationTypeOption, lng);
    const form = new GenericForm(orderJudge);
    await form.validate();
    if (form.hasErrors()) {
      res.render(viewPath, {
        form,
        cancelUrl,
        backLinkUrl,
        applicationType,
        contentList,
        hintText,
      });
    } else {
      await saveOrderJudge(redisKey, orderJudge, orderJudgeIndex);
      res.redirect('test'); // TODO: add url
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default orderJudgeController;
