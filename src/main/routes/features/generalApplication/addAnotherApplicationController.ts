import { NextFunction, Response, Router } from 'express';
import { AppRequest } from 'common/models/AppRequest';
import { GA_ADD_ANOTHER_APPLICATION_URL } from 'routes/urls';
import { getClaimById } from 'modules/utilityService';
import { getCancelUrl } from 'services/features/generalApplication/generalApplicationService';
import { selectedApplicationType } from 'common/models/generalApplication/applicationType';
import { GenericForm } from 'common/form/models/genericForm';
import { GenericYesNo } from 'common/form/models/genericYesNo';
import { generateRedisKey } from 'modules/draft-store/draftStoreService';

const addAnotherApplicationController = Router();
const viewPath = 'features/generalApplication/add-another-application';

const renderView = async (req: AppRequest, res: Response, form?: GenericForm<GenericYesNo>): Promise<void> => {
  const backLinkUrl = '/test';
  const redisKey = generateRedisKey(req);
  const claim = await getClaimById(redisKey, req, true);
  const cancelUrl = await getCancelUrl(req.params.id, claim);
  const applicationType = selectedApplicationType[claim.generalApplication?.applicationType?.option];
  if (!form) {
    form = new GenericForm(new GenericYesNo(''));
  }
  res.render(viewPath, { form, cancelUrl, backLinkUrl, applicationType });
};

addAnotherApplicationController.get(GA_ADD_ANOTHER_APPLICATION_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  renderView(req, res).catch((error) => {
    next(error);
  });
});

addAnotherApplicationController.post(GA_ADD_ANOTHER_APPLICATION_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const form = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.GENERAL_APPLICATION.WANT_TO_ADD_ANOTHER_APPLICATION'));
    await form.validate();
    if (form.hasErrors()) {
      await renderView(req, res, form);
    } else {
      res.redirect('test');
    }
  } catch (error) {
    next(error);
  }
});

export default addAnotherApplicationController;