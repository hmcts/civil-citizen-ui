import { GenericForm } from 'common/form/models/genericForm';
import { AppRequest } from 'common/models/AppRequest';
import { selectedApplicationType } from 'common/models/generalApplication/applicationType';
import { InformOtherParties } from 'common/models/generalApplication/informOtherParties';
import { NextFunction, RequestHandler, Response, Router } from 'express';
import { generateRedisKey, getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
import { INFORM_OTHER_PARTIES } from 'routes/urls';
import { getCancelUrl, saveInformOtherParties } from 'services/features/generalApplication/generalApplicationService';

const viewPath = 'features/generalApplication/inform-other-parties';
const informOtherPartiesController = Router();
const backLinkUrl = 'test'; // TODO: add url

const renderView = async (req: AppRequest, res: Response, form?: GenericForm<InformOtherParties>): Promise<void> => {
    const claimId = req.params.id;
    const redisKey = generateRedisKey(req);
    const claim = await getCaseDataFromStore(redisKey);
    const cancelUrl = await getCancelUrl(claimId, claim);
    if (!form) {
      form = new GenericForm(new InformOtherParties(claim.generalApplication?.informOtherParties?.option, claim.generalApplication?.informOtherParties?.reasonForCourtNotInformingOtherParties));
    }
    res.render(viewPath, {
      cancelUrl,
      backLinkUrl,
      applicationType: selectedApplicationType[claim.generalApplication?.applicationType?.option],
      form,
    });
};

informOtherPartiesController.get(INFORM_OTHER_PARTIES, (req: AppRequest, res: Response, next: NextFunction) => {
  renderView(req, res).catch((error) => {
    next(error);
  });

});

informOtherPartiesController.post(INFORM_OTHER_PARTIES, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const informOtherParties = new InformOtherParties(req.body.option, req.body?.reasonForCourtNotInformingOtherParties);
    const form = new GenericForm(informOtherParties);
    await form.validate();
    if (form.hasErrors()) {
      return await renderView(req, res, form);
    }
    await saveInformOtherParties(generateRedisKey(req), informOtherParties);
    res.redirect('test'); // TODO: add url
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default informOtherPartiesController;