import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {APPLICATION_TYPE_URL} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {ApplicationType, ApplicationTypeOption} from 'common/models/generalApplication/applicationType';
import {getListOfNotAllowedAdditionalAppType, saveApplicationType} from 'services/features/generalApplication/generalApplicationService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {getClaimById} from 'modules/utilityService';
import { FormValidationError } from 'common/form/validationErrors/formValidationError';
import { GenericYesNo } from 'common/form/models/genericYesNo';
import { Claim } from 'common/models/claim';
import { ValidationError } from 'class-validator';

const applicationTypeController = Router();
const viewPath = 'features/generalApplication/application-type';
const cancelUrl = 'test'; // TODO: add url
const backLinkUrl = 'test'; // TODO: add url

applicationTypeController.get(APPLICATION_TYPE_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const queryApplicationTypeIndex = req.query.index;
    const applicationTypeOption  = queryApplicationTypeIndex
      ? claim.generalApplication?.applicationTypes[parseInt(queryApplicationTypeIndex as string)]?.option
      : undefined;
    const applicationType = new ApplicationType(applicationTypeOption);
    const form = new GenericForm(applicationType);
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
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    let applicationType = null;

    if (req.body.option === ApplicationTypeOption.OTHER) {
      applicationType = new ApplicationType(req.body.optionOther);
    } else {
      applicationType = new ApplicationType(req.body.option);
    }

    const form = new GenericForm(applicationType);
    form.validateSync();

    validateAdditionalApplicationtType(claim,form.errors,applicationType,req as AppRequest);

    if (form.hasErrors()) {
      res.render(viewPath, { form, cancelUrl, backLinkUrl,isOtherSelected: applicationType.isOtherSelected() });
    } else {
      const queryApplicationTypeIndex = req.query.index;
      const applicationTypeIndex = queryApplicationTypeIndex
        ? parseInt(queryApplicationTypeIndex as string)
        : undefined;
      await saveApplicationType(redisKey, applicationType, applicationTypeIndex);
      res.redirect('test'); // TODO: add url
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export const additionalApplicationErrorMessages: Partial<{ [key in ApplicationTypeOption]: string; }> = {
  [ApplicationTypeOption.SETTLE_BY_CONSENT]: 'ERRORS.GENERAL_APPLICATION.ADDITIONAL_APPLICATION_ASK_SETTLING',
  [ApplicationTypeOption.SET_ASIDE_JUDGEMENT]: 'ERRORS.GENERAL_APPLICATION.ADDITIONAL_APPLICATION_ASK_CANCEL_JUDGMENT',
  [ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT]: 'ERRORS.GENERAL_APPLICATION.ADDITIONAL_APPLICATION_ASK_VARY_JUDGMENT',
};

function validateAdditionalApplicationtType(claim : Claim, errors : ValidationError[],applicationType : ApplicationType,req: AppRequest) {
 
  if(claim.generalApplication?.applicationTypes?.length > 0 && getListOfNotAllowedAdditionalAppType().includes(applicationType.option)) {
    const errorMessage = additionalApplicationErrorMessages[applicationType.option];

    const validationError = new FormValidationError({
      target: new GenericYesNo(req.body.optionOther, ''),
      value: req.body.option,
      constraints: {
        additionalApplicationError : errorMessage,
      },
      property: 'option',
    });

    errors.push(validationError);

  }
}

export default applicationTypeController;
