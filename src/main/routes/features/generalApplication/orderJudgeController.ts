
import { NextFunction, RequestHandler, Response, Router } from 'express';
import {
  APPLICATION_TYPE_URL,
  GA_CLAIM_APPLICATION_COST_URL,
  GA_REQUESTING_REASON_URL,
  ORDER_JUDGE_URL,
} from 'routes/urls';
import { GenericForm } from 'common/form/models/genericForm';
import { AppRequest } from 'common/models/AppRequest';
import {
  ApplicationTypeOptionSelection,
  getApplicationTypeOptionByTypeAndDescription,
  LinKFromValues,
} from 'common/models/generalApplication/applicationType';
import { getByIndex, getByIndexOrLast, getCancelUrl, saveOrderJudge } from 'services/features/generalApplication/generalApplicationService';
import { generateRedisKey } from 'modules/draft-store/draftStoreService';
import { getClaimById } from 'modules/utilityService';
import { OrderJudge } from 'common/models/generalApplication/orderJudge';
import { buildPageContent } from 'services/features/generalApplication/orderJudgePageBuilder';
import { orderJudgeGuard } from 'routes/guards/generalApplication/orderJudgeGuard';
import { GeneralApplication } from 'common/models/generalApplication/GeneralApplication';
import { queryParamNumber } from 'common/utils/requestUtils';
import {constructResponseUrlWithIdParams, constructUrlWithIndex} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';

const orderJudgeController = Router();
const viewPath = 'features/generalApplication/order-judge';

orderJudgeController.get(ORDER_JUDGE_URL, orderJudgeGuard, (async (req: AppRequest, res: Response, next: NextFunction) => {
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
    const backLinkUrl = getBackLinkUrl(claimId, claim, applicationTypeIndex);

    const form = new GenericForm(orderJudge);
    res.render(viewPath, {
      form,
      cancelUrl,
      backLinkUrl,
      applicationType: getApplicationTypeOptionByTypeAndDescription(applicationTypeOption,ApplicationTypeOptionSelection.BY_APPLICATION_TYPE),
      contentList,
      hintText: orderJudge.text ? orderJudge.text : hintText,
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

orderJudgeController.post(ORDER_JUDGE_URL, orderJudgeGuard, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const cancelUrl = await getCancelUrl(claimId, claim);
    const redisKey = generateRedisKey(<AppRequest>req);
    const orderJudge = Object.assign(new OrderJudge(), req.body);
    const index = queryParamNumber(req, 'index');
    const backLinkUrl = constructResponseUrlWithIdParams(claimId, GA_CLAIM_APPLICATION_COST_URL);

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
        applicationType: getApplicationTypeOptionByTypeAndDescription(applicationTypeOption,ApplicationTypeOptionSelection.BY_APPLICATION_TYPE ),
        contentList,
        hintText,
      });
    } else {
      await saveOrderJudge(redisKey, orderJudge, index);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, GA_REQUESTING_REASON_URL)
        + (index >= 0 ? `?index=${index}` : ''));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

function getBackLinkUrl(claimId: string, claim: Claim, index: number) : string {
  const appTypesLength = claim.generalApplication?.applicationTypes?.length;
  if (!appTypesLength || appTypesLength === 1) {
    return constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, GA_CLAIM_APPLICATION_COST_URL), index);
  } else {
    return constructResponseUrlWithIdParams(claimId, APPLICATION_TYPE_URL) + `?linkFrom=${LinKFromValues.addAnotherApp}&index=${index}`;
  }

}

export default orderJudgeController;
