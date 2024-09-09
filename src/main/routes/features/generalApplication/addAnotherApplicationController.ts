import { NextFunction, Response, Router } from 'express';
import { AppRequest } from 'common/models/AppRequest';
import {
  APPLICATION_TYPE_URL,
  GA_ADD_ANOTHER_APPLICATION_URL,
  GA_REQUESTING_REASON_URL,
  GA_WANT_TO_UPLOAD_DOCUMENTS_URL,
} from 'routes/urls';
import { getClaimById } from 'modules/utilityService';
import { getCancelUrl, getLast } from 'services/features/generalApplication/generalApplicationService';
import {LinKFromValues, selectedApplicationType} from 'common/models/generalApplication/applicationType';
import { GenericForm } from 'common/form/models/genericForm';
import { GenericYesNo } from 'common/form/models/genericYesNo';
import { generateRedisKey } from 'modules/draft-store/draftStoreService';
import {YesNo} from 'form/models/yesNo';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {addAnotherApplicationGuard} from 'routes/guards/generalApplication/addAnotherApplicationGuard';

const addAnotherApplicationController = Router();
const viewPath = 'features/generalApplication/add-another-application';

const renderView = async (req: AppRequest, res: Response, form?: GenericForm<GenericYesNo>): Promise<void> => {
  const backLinkUrl = constructResponseUrlWithIdParams(req.params.id, GA_REQUESTING_REASON_URL);
  const redisKey = generateRedisKey(req);
  const claim = await getClaimById(redisKey, req, true);
  const cancelUrl = await getCancelUrl(req.params.id, claim);
  const applicationType = selectedApplicationType[getLast(claim.generalApplication?.applicationTypes)?.option];
  if (!form) {
    form = new GenericForm(new GenericYesNo(''));
  }
  res.render(viewPath, { form, cancelUrl, backLinkUrl, applicationType });
};

addAnotherApplicationController.get(GA_ADD_ANOTHER_APPLICATION_URL, addAnotherApplicationGuard, async (req: AppRequest, res: Response, next: NextFunction) => {
  renderView(req, res).catch((error) => {
    next(error);
  });
});

addAnotherApplicationController.post(GA_ADD_ANOTHER_APPLICATION_URL, addAnotherApplicationGuard, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const form = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.GENERAL_APPLICATION.WANT_TO_ADD_ANOTHER_APPLICATION'));
    await form.validate();
    if (form.hasErrors()) {
      await renderView(req, res, form);
    } else {
      res.redirect(getRedirectUrl(req.params.id, req.body.option));
    }

  } catch (error) {
    next(error);
  }
});

function getRedirectUrl(claimId: string, option: YesNo): string {
  return (option === YesNo.YES) ? constructResponseUrlWithIdParams(claimId, APPLICATION_TYPE_URL) + '?linkFrom=' + LinKFromValues.addAnotherApp :
    constructResponseUrlWithIdParams(claimId, GA_WANT_TO_UPLOAD_DOCUMENTS_URL);
}
export default addAnotherApplicationController;
