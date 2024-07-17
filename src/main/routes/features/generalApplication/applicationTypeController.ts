import { NextFunction, Request, RequestHandler, Response, Router } from 'express';
import {
  APPLICATION_TYPE_URL, GA_ADD_ANOTHER_APPLICATION_URL,
  GA_AGREEMENT_FROM_OTHER_PARTY_URL,
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
  saveApplicationType, validateAdditionalApplicationtType,
} from 'services/features/generalApplication/generalApplicationService';
import { generateRedisKey } from 'modules/draft-store/draftStoreService';
import { getClaimById } from 'modules/utilityService';
import { queryParamNumber } from 'common/utils/requestUtils';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import { GeneralApplication } from 'common/models/generalApplication/GeneralApplication';

const applicationTypeController = Router();
const viewPath = 'features/generalApplication/application-type';

applicationTypeController.get(APPLICATION_TYPE_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const applicationId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const applicationIndex = queryParamNumber(req, 'index');
    const generalApplication = claim.generalApplications.find(a => a.id === applicationId);
    const applicationTypeOption = getByIndex(generalApplication?.applicationTypes, applicationIndex)?.option;
    const applicationType = new ApplicationType(applicationTypeOption);
    const form = new GenericForm(applicationType);
    const cancelUrl = await getCancelUrl(claimId, claim);
    const backLinkUrl = await getBackLinkUrl(claimId, generalApplication, cancelUrl);
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
    const applicationIndex = queryParamNumber(req, 'index');
    if (req.body.option === ApplicationTypeOption.OTHER) {
      applicationType = new ApplicationType(req.body.optionOther);
    } else {
      applicationType = new ApplicationType(req.body.option);
    }

    const form = new GenericForm(applicationType);
    form.validateSync();
    if(!applicationIndex && applicationIndex != 0) {
      validateAdditionalApplicationtType(claim,form.errors,applicationType,req.body);
    }
    const cancelUrl = await getCancelUrl( req.params.id, claim);
    const applicationId = req.params.id;
    const generalApplication = claim.generalApplications.find(a => a.id === applicationId);
    const backLinkUrl = await getBackLinkUrl(req.params.id, generalApplication, cancelUrl);

    if (form.hasErrors()) {
      res.render(viewPath, { form, cancelUrl, backLinkUrl, isOtherSelected: applicationType.isOtherSelected() });
    } else {
      await saveApplicationType(redisKey, applicationType, applicationIndex);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, GA_AGREEMENT_FROM_OTHER_PARTY_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

async function getBackLinkUrl(claimId: string, generalApplication: GeneralApplication, cancelUrl: string) {
  return (!generalApplication?.applicationTypes) ? cancelUrl
    : constructResponseUrlWithIdParams(claimId, GA_ADD_ANOTHER_APPLICATION_URL);
}

export default applicationTypeController;
