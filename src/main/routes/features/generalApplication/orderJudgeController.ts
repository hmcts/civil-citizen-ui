
import { NextFunction, Request, RequestHandler, Response, Router } from 'express';
import { ORDER_JUDGE_URL } from 'routes/urls';
import { GenericForm } from 'common/form/models/genericForm';
import { AppRequest } from 'common/models/AppRequest';
import { selectedApplicationType } from 'common/models/generalApplication/applicationType';
import { getByIndex, getByIndexOrLast, getCancelUrl, saveOrderJudge } from 'services/features/generalApplication/generalApplicationService';
import { generateRedisKey } from 'modules/draft-store/draftStoreService';
import { getClaimById } from 'modules/utilityService';
import { OrderJudge } from 'common/models/generalApplication/orderJudge';
import { buildPageContent } from 'services/features/generalApplication/orderJudgePageBuilder';
import { orderJudgeGuard } from 'routes/guards/orderJudgeGuard';
import { GeneralApplication } from 'common/models/generalApplication/GeneralApplication';
import { queryParamNumber } from 'common/utils/requestUtils';

const orderJudgeController = Router();
const viewPath = 'features/generalApplication/order-judge';
const backLinkUrl = 'test'; // TODO: add url

orderJudgeController.get(ORDER_JUDGE_URL, [orderJudgeGuard], (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const cancelUrl = await getCancelUrl(claimId, claim);
    const { applicationTypes, orderJudges } = claim.generalApplication || new GeneralApplication();
    const applicationTypeIndex = queryParamNumber(req, 'index');
    const applicationTypeOption = getByIndexOrLast(applicationTypes, applicationTypeIndex)?.option;
    const orderJudge = getByIndex(orderJudges, applicationTypeIndex) || new OrderJudge();
    const { contentList, hintText } = buildPageContent(applicationTypeOption, lng);

    const form = new GenericForm(orderJudge);
    res.render(viewPath, {
      form,
      cancelUrl,
      backLinkUrl,
      applicationType: selectedApplicationType[applicationTypeOption],
      contentList,
      hintText: orderJudge.text ? orderJudge.text : hintText,
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

orderJudgeController.post(ORDER_JUDGE_URL, [orderJudgeGuard], (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const cancelUrl = await getCancelUrl(claimId, claim);
    const redisKey = generateRedisKey(<AppRequest>req);
    const orderJudge = Object.assign(new OrderJudge(), req.body);
    const index = queryParamNumber(req, 'index');

    const form = new GenericForm(orderJudge);
    await form.validate();
    if (form.hasErrors()) {
      const applicationType = getByIndexOrLast(claim.generalApplication?.applicationTypes, index);
      const applicationTypeOption = applicationType?.option;
      const { contentList, hintText } = buildPageContent(applicationTypeOption, lng);
      res.render(viewPath, {
        form,
        cancelUrl,
        backLinkUrl,
        applicationType: selectedApplicationType[applicationTypeOption],
        contentList,
        hintText,
      });
    } else {
      await saveOrderJudge(redisKey, orderJudge, index);
      res.redirect('test'); // TODO: add url
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default orderJudgeController;
