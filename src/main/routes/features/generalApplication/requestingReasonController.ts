import { NextFunction, Request, RequestHandler, Response, Router } from 'express';
import {
  GA_ADD_ANOTHER_APPLICATION_URL,
  GA_REQUESTING_REASON_URL,
  GA_WANT_TO_UPLOAD_DOCUMENTS, ORDER_JUDGE_URL,
} from 'routes/urls';
import { GenericForm } from 'common/form/models/genericForm';
import { AppRequest } from 'common/models/AppRequest';
import {ApplicationTypeOption, selectedApplicationType} from 'common/models/generalApplication/applicationType';
import { generateRedisKey } from 'modules/draft-store/draftStoreService';
import { getClaimById } from 'modules/utilityService';
import { RequestingReason } from 'models/generalApplication/requestingReason';
import { getByIndex, getByIndexOrLast, saveRequestingReason } from 'services/features/generalApplication/generalApplicationService';
import { buildRequestingReasonPageContent } from 'services/features/generalApplication/requestingReasonPageBuilder';
import { queryParamNumber } from 'common/utils/requestUtils';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';

const requestingReasonController = Router();
const viewPath = 'features/generalApplication/requesting-reason';
const cancelUrl = 'test'; // TODO: add url
const options = [ApplicationTypeOption.SETTLE_BY_CONSENT, ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT, ApplicationTypeOption.SET_ASIDE_JUDGEMENT];

requestingReasonController.get(GA_REQUESTING_REASON_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const applicationIndex = queryParamNumber(req, 'index');
    const generalApplication = claim.generalApplication;
    const applicationTypeOption = getByIndexOrLast(generalApplication?.applicationTypes, applicationIndex)?.option;
    const requestingReasonText = getByIndex(generalApplication?.requestingReasons, applicationIndex)?.text;
    const requestingReason = new RequestingReason(requestingReasonText);
    const applicationType = selectedApplicationType[applicationTypeOption];
    const contentList = buildRequestingReasonPageContent(applicationTypeOption, lng);
    const backLinkUrl = constructResponseUrlWithIdParams(claimId, ORDER_JUDGE_URL);
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
    const applicationIndex = queryParamNumber(req, 'index');
    const applicationTypeOption = getByIndexOrLast(claim.generalApplication?.applicationTypes, applicationIndex)?.option;
    const contentList = buildRequestingReasonPageContent(applicationTypeOption, lng);
    const backLinkUrl = constructResponseUrlWithIdParams(claimId, ORDER_JUDGE_URL);

    const form = new GenericForm(requestingReason);
    await form.validate();
    if (form.hasErrors()) {
      res.render(viewPath, {
        form,
        cancelUrl,
        backLinkUrl,
        applicationType: selectedApplicationType[applicationTypeOption],
        contentList,
      });
    } else {
      await saveRequestingReason(redisKey, requestingReason, applicationIndex);
      res.redirect(getRedirectUrl(claimId, claim, applicationTypeOption));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

function getRedirectUrl(claimId: string, claim: Claim, applicationTypeOption: ApplicationTypeOption): string {
  if (options.indexOf(applicationTypeOption) !== -1) {
    return constructResponseUrlWithIdParams(claimId, GA_WANT_TO_UPLOAD_DOCUMENTS);
  } else {
    return constructResponseUrlWithIdParams(claimId, GA_ADD_ANOTHER_APPLICATION_URL);
  }
}
export default requestingReasonController;
