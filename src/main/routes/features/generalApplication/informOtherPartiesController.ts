import { GenericForm } from 'common/form/models/genericForm';
import { AppRequest } from 'common/models/AppRequest';
import { InformOtherParties } from 'common/models/generalApplication/informOtherParties';
import {constructResponseUrlWithIdParams, constructUrlWithIndex} from 'common/utils/urlFormatter';
import { NextFunction, RequestHandler, Response, Router } from 'express';
import { generateRedisKey, getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
import {
  BACK_URL,
  GA_APPLICATION_COSTS_URL,
  INFORM_OTHER_PARTIES_URL,
} from 'routes/urls';
import { getCancelUrl, getLast, saveInformOtherParties } from 'services/features/generalApplication/generalApplicationService';
import {informOtherPartiesGuard} from 'routes/guards/generalApplication/informOtherPartiesGuard';
import {
  ApplicationTypeOptionSelection,
  getApplicationTypeOptionByTypeAndDescription,
} from 'models/generalApplication/applicationType';
import {queryParamNumber} from 'common/utils/requestUtils';

const viewPath = 'features/generalApplication/inform-other-parties';
const informOtherPartiesController = Router();

const renderView = async (req: AppRequest, res: Response, form?: GenericForm<InformOtherParties>): Promise<void> => {
  const claimId = req.params.id;
  const redisKey = generateRedisKey(req);
  const claim = await getCaseDataFromStore(redisKey);
  const cancelUrl = await getCancelUrl(claimId, claim);
  const backLinkUrl = BACK_URL;
  if (!form) {
    form = new GenericForm(new InformOtherParties(claim.generalApplication?.informOtherParties?.option, claim.generalApplication?.informOtherParties?.reasonForCourtNotInformingOtherParties));
  }
  res.render(viewPath, {
    cancelUrl,
    backLinkUrl,
    applicationType: getApplicationTypeOptionByTypeAndDescription(getLast(claim.generalApplication?.applicationTypes)?.option,ApplicationTypeOptionSelection.BY_APPLICATION_TYPE ),
    form,
  });
};

informOtherPartiesController.get(INFORM_OTHER_PARTIES_URL, informOtherPartiesGuard,(req: AppRequest, res: Response, next: NextFunction) => {
  renderView(req, res).catch((error) => {
    next(error);
  });

});

informOtherPartiesController.post(INFORM_OTHER_PARTIES_URL, informOtherPartiesGuard, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const informOtherParties = new InformOtherParties(req.body.option, req.body?.reasonForCourtNotInformingOtherParties);
    const form = new GenericForm(informOtherParties);
    await form.validate();
    if (form.hasErrors()) {
      return await renderView(req, res, form);
    }
    await saveInformOtherParties(generateRedisKey(req), informOtherParties);
    const index  = queryParamNumber(req, 'index');
    res.redirect(constructUrlWithIndex(constructResponseUrlWithIdParams(req.params.id, GA_APPLICATION_COSTS_URL), index));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default informOtherPartiesController;
