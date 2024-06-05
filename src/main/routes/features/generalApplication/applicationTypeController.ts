import { NextFunction, Request, RequestHandler, Response, Router } from 'express';
import {
  APPLICATION_TYPE_URL, GA_ADD_ANOTHER_APPLICATION_URL,
  GA_AGREEMENT_FROM_OTHER_PARTY,
} from 'routes/urls';
import { GenericForm } from 'common/form/models/genericForm';
import { AppRequest } from 'common/models/AppRequest';
import {
  ApplicationType,
  ApplicationTypeOption,
} from 'common/models/generalApplication/applicationType';
import {
  getByIndex,
  getCancelUrl,
  saveApplicationType
} from 'services/features/generalApplication/generalApplicationService';
import { generateRedisKey } from 'modules/draft-store/draftStoreService';
import { getClaimById } from 'modules/utilityService';
import { queryParamNumber } from 'common/utils/requestUtils';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';

const applicationTypeController = Router();
const viewPath = 'features/generalApplication/application-type';

applicationTypeController.get(APPLICATION_TYPE_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const applicationIndex = queryParamNumber(req, 'index');
    const applicationTypeOption = getByIndex(claim.generalApplication?.applicationTypes, applicationIndex)?.option;
    const applicationType = new ApplicationType(applicationTypeOption);
    const form = new GenericForm(applicationType);
    const cancelUrl = await getCancelUrl(claimId, claim);
    const backLinkUrl = await getBackLinkUrl(claimId, claim, cancelUrl);
    res.render(viewPath, {
      form,
      cancelUrl,
      backLinkUrl,
      isOtherSelected: applicationType.isOtherSelected(),
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

applicationTypeController.post(APPLICATION_TYPE_URL, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getClaimById(redisKey, req, true);
    let applicationType = null;

    if (req.body.option === ApplicationTypeOption.OTHER) {
      applicationType = new ApplicationType(req.body.optionOther);
    } else {
      applicationType = new ApplicationType(req.body.option);
    }

    const form = new GenericForm(applicationType);
    await form.validate();
    const cancelUrl = await getCancelUrl( req.params.id, claim);
    const backLinkUrl = await getBackLinkUrl(req.params.id, claim, cancelUrl);
    if (form.hasErrors()) {
      res.render(viewPath, { form, cancelUrl, backLinkUrl });
    } else {
      const applicationIndex = queryParamNumber(req, 'index');
      await saveApplicationType(redisKey, applicationType, applicationIndex);
    }
   // const redirectUrl = await getRedirectUrl(applicationType.option, req.params.id, claim);
    res.redirect(constructResponseUrlWithIdParams(req.params.id, GA_AGREEMENT_FROM_OTHER_PARTY));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

/*async function getRedirectUrl(applicationType: ApplicationTypeOption, claimId: string, claim: Claim): Promise<string> {
  if (claim?.generalApplication?.applicationTypes?.length >= 1) {
    return constructResponseUrlWithIdParams(claimId, ORDER_JUDGE_URL);
  } else if (applicationType === ApplicationTypeOption.SETTLE_BY_CONSENT) {
    return constructResponseUrlWithIdParams(claimId, GA_APPLICATION_COSTS_URL);
  } else {
    return constructResponseUrlWithIdParams(claimId, GA_AGREEMENT_FROM_OTHER_PARTY);
  }
}*/

async function getBackLinkUrl(claimId: string, claim: Claim, cancelUrl: string) {
  if (!claim?.generalApplication?.applicationTypes) {
    return cancelUrl;
  }
  return constructResponseUrlWithIdParams(claimId, GA_ADD_ANOTHER_APPLICATION_URL);
}

export default applicationTypeController;
