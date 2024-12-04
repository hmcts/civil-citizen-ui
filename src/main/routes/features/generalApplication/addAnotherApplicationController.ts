import {NextFunction, Response, Router} from 'express';
import {AppRequest} from 'common/models/AppRequest';
import {
  APPLICATION_TYPE_URL,
  GA_ADD_ANOTHER_APPLICATION_URL,
  GA_REQUESTING_REASON_URL,
  GA_WANT_TO_UPLOAD_DOCUMENTS_URL,
} from 'routes/urls';
import {getClaimById} from 'modules/utilityService';
import {
  getByIndexOrLast,
  getCancelUrl, removeAllOtherApplications,
} from 'services/features/generalApplication/generalApplicationService';
import {
  ApplicationTypeOptionSelection,
  getApplicationTypeOptionByTypeAndDescription,
  LinKFromValues,
} from 'common/models/generalApplication/applicationType';
import {GenericForm} from 'common/form/models/genericForm';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {generateRedisKey, saveDraftClaim} from 'modules/draft-store/draftStoreService';
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
  let value;
  if (!form) {
    if (claim.generalApplication?.addType) {
      value = (claim.generalApplication?.applicationTypes.length > 1) ? YesNo.YES : YesNo.NO;
    } else {
      value = '';
    }
    form = new GenericForm(new GenericYesNo(value));
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
      const redisKey = generateRedisKey(req);
      const claim = await getClaimById(redisKey, req, true);

      const claimId = req.params.id;
      claim.generalApplication.addType = true;
      if (req.body.option === YesNo.YES) {
        await saveDraftClaim(redisKey, claim);
        res.redirect(constructResponseUrlWithIdParams(claimId, APPLICATION_TYPE_URL) + '?linkFrom=' + LinKFromValues.addAnotherApp);
      } else {
        let index = queryParamNumber(req, 'index') || claim.generalApplication.applicationTypes.length - 1;
        //todo add if with changeScreen
        if (req.query['changeScreen'] === 'true'){
          await removeAllOtherApplications(redisKey, claim);
          index = claim.generalApplication.applicationTypes.length - 1;
        } else {
          await saveDraftClaim(redisKey, claim);
        }
        res.redirect(constructUrlWithIndex(constructResponseUrlWithIdParams(claimId, GA_WANT_TO_UPLOAD_DOCUMENTS_URL), index));
      }
    }

  } catch (error) {
    next(error);
  }
});

function getBackLinkUrl(claimId: string, index: number) : string {
  const indexParam = `?index=${index}`;
  return constructResponseUrlWithIdParams(claimId, GA_REQUESTING_REASON_URL) + indexParam;
}

export default addAnotherApplicationController;
