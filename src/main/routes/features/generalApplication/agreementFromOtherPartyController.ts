import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {APPLICATION_TYPE_URL, GA_AGREEMENT_FROM_OTHER_PARTY} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import { GenericYesNo } from 'common/form/models/genericYesNo';
import { generateRedisKey } from 'modules/draft-store/draftStoreService';
import { getClaimById } from 'modules/utilityService';
import { saveAgreementFromOtherParty} from 'services/features/generalApplication/generalApplicationService';
import { ApplicationTypeOption, selectedApplicationType } from 'common/models/generalApplication/applicationType';
import { YesNo } from 'common/form/models/yesNo';
import { FormValidationError } from 'common/form/validationErrors/formValidationError';
import { ValidationError } from 'class-validator';

const agreementFromOtherPartyController = Router();
const viewPath = 'features/generalApplication/agreement-from-other-party';
const cancelUrl = 'test';


agreementFromOtherPartyController.get(GA_AGREEMENT_FROM_OTHER_PARTY, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {

     const backLinkUrl = getBackLinkUrl(<AppRequest>req);
     const redisKey = generateRedisKey(<AppRequest>req);
     const claim = await getClaimById(redisKey, req, true);
   
     const applicationType = selectedApplicationType[claim.generalApplication?.applicationType?.option];
     const form = new GenericForm(new GenericYesNo(claim.generalApplication?.agreementFromOtherParty));
   
     res.render(viewPath, {
       form,
       applicationType,
       cancelUrl,
       backLinkUrl
     });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

agreementFromOtherPartyController.post(GA_AGREEMENT_FROM_OTHER_PARTY, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
   
    const backLinkUrl = getBackLinkUrl(<AppRequest>req);
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getClaimById(redisKey, req, true);
    const applicationTypeOption = claim.generalApplication?.applicationType?.option;
    const applicationType = selectedApplicationType[applicationTypeOption];
    const form = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.GENERAL_APPLICATION.APPLICATION_FROM_OTHER_PARTY_EMPTY_OPTION'));
   
    form.validateSync();
    
    // Validate No option for application type Settle by Consent
    validateNoConsentOption(<AppRequest>req, form.errors,applicationTypeOption);

    if (form.hasErrors()) {
      res.render(viewPath, { form, applicationType,cancelUrl, backLinkUrl });
    } else {
      await saveAgreementFromOtherParty(redisKey, req.body.option);
      res.redirect('test');
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

function getBackLinkUrl(req: AppRequest) : string {
  const claimId = req.params.id;
  return APPLICATION_TYPE_URL.replace(':id', claimId);
}

function validateNoConsentOption(req: AppRequest, errors : ValidationError[], applicationTypeOption : string) {
 
  if(req.body.option === YesNo.NO && applicationTypeOption === ApplicationTypeOption.SETTLE_BY_CONSENT) {
   
   const validationError = new FormValidationError({
    target: new GenericYesNo(req.body.option, ''),
    value: req.body.option,
    constraints: {
      shouldNotBeNoForSettleByConsent :'ERRORS.GENERAL_APPLICATION.APPLICATION_FROM_OTHER_PARTY_OPTION_NO_SELECTED'
    },
    property: 'option'
    });

    errors.push(validationError);
  }
}

export default agreementFromOtherPartyController;
