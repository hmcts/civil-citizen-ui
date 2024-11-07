import {NextFunction, Response, Router} from 'express';
import {AppRequest} from 'common/models/AppRequest';
import {
  APPLICATION_TYPE_URL,
  GA_ADD_ANOTHER_APPLICATION_URL,
  GA_REQUESTING_REASON_URL,
  GA_WANT_TO_UPLOAD_DOCUMENTS_URL,
} from 'routes/urls';
import {getClaimById} from 'modules/utilityService';
import {getByIndexOrLast, getCancelUrl} from 'services/features/generalApplication/generalApplicationService';
import {
  ApplicationTypeOptionSelection,
  getApplicationTypeOptionByTypeAndDescription,
  LinKFromValues,
} from 'common/models/generalApplication/applicationType';
import {GenericForm} from 'common/form/models/genericForm';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {YesNo} from 'form/models/yesNo';
import {constructResponseUrlWithIdParams, constructUrlWithIndex} from 'common/utils/urlFormatter';
import {addAnotherApplicationGuard} from 'routes/guards/generalApplication/addAnotherApplicationGuard';
import {queryParamNumber} from 'common/utils/requestUtils';

const addAnotherApplicationController = Router();
const viewPath = 'features/generalApplication/add-another-application';

const renderView = async (req: AppRequest, res: Response, form?: GenericForm<GenericYesNo>): Promise<void> => {
  const claimId = req.params.id;
  const redisKey = generateRedisKey(req);
  const claim = await getClaimById(redisKey, req, true);
  const applicationIndex = queryParamNumber(req, 'index') || claim.generalApplication.applicationTypes.length - 1;
  const backLinkUrl = getBackLinkUrl(claimId, applicationIndex);
  const cancelUrl = await getCancelUrl(claimId, claim);
  const applicationTypeOption = getByIndexOrLast(claim.generalApplication?.applicationTypes, applicationIndex)?.option;
  const applicationType = getApplicationTypeOptionByTypeAndDescription(applicationTypeOption, ApplicationTypeOptionSelection.BY_APPLICATION_TYPE);
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
      const index  = queryParamNumber(req, 'index');
      res.redirect(getRedirectUrl(req.params.id, req.body.option, index));
    }

  } catch (error) {
    next(error);
  }
});

function getRedirectUrl(claimId: string, option: YesNo, index: number): string {
  return (option === YesNo.YES) ? constructResponseUrlWithIdParams(claimId, APPLICATION_TYPE_URL) + '?linkFrom=' + LinKFromValues.addAnotherApp :
    constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, GA_WANT_TO_UPLOAD_DOCUMENTS_URL), index);
}

function getBackLinkUrl(claimId: string, index: number) : string {
  const indexParam = `?index=${index}`;
  return constructResponseUrlWithIdParams(claimId, GA_REQUESTING_REASON_URL) + indexParam;
}

export default addAnotherApplicationController;
