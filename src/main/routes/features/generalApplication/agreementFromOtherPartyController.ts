import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  BACK_URL,
  GA_AGREEMENT_FROM_OTHER_PARTY_URL,
} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import { GenericYesNo } from 'common/form/models/genericYesNo';
import { generateRedisKey } from 'modules/draft-store/draftStoreService';
import { getClaimById } from 'modules/utilityService';
import {
  getAgreementFromOtherPartiesNextUrl,
  getCancelUrl,
  getLast,
  saveAgreementFromOtherParty,
  validateNoConsentOption,
} from 'services/features/generalApplication/generalApplicationService';
import {
  ApplicationTypeOptionSelection,
  getApplicationTypeOptionByTypeAndDescription,
} from 'models/generalApplication/applicationType';

const agreementFromOtherPartyController = Router();
const viewPath = 'features/generalApplication/agreement-from-other-party';

agreementFromOtherPartyController.get(GA_AGREEMENT_FROM_OTHER_PARTY_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getClaimById(redisKey, req, true);
    //const applicationIndex = queryParamNumber(req, 'index') || claim.generalApplication.applicationTypes.length - 1;
    const backLinkUrl = BACK_URL;
    const cancelUrl = await getCancelUrl(req.params.id, claim);
    const applicationType = getApplicationTypeOptionByTypeAndDescription(getLast(claim.generalApplication?.applicationTypes)?.option,ApplicationTypeOptionSelection.BY_APPLICATION_TYPE );
    const form = new GenericForm(new GenericYesNo(claim.generalApplication?.agreementFromOtherParty));

    res.render(viewPath, {
      form,
      applicationType,
      cancelUrl,
      backLinkUrl,
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

agreementFromOtherPartyController.post(GA_AGREEMENT_FROM_OTHER_PARTY_URL, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getClaimById(redisKey, req, true);
    const backLinkUrl = BACK_URL;
    const cancelUrl = await getCancelUrl(req.params.id, claim);
    const applicationTypeOption = getLast(claim.generalApplication?.applicationTypes)?.option;
    const applicationType = getApplicationTypeOptionByTypeAndDescription(applicationTypeOption, ApplicationTypeOptionSelection.BY_APPLICATION_TYPE);
    const form = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.GENERAL_APPLICATION.APPLICATION_FROM_OTHER_PARTY_EMPTY_OPTION'));

    form.validateSync();

    // Validate No option for application type Settle by Consent
    validateNoConsentOption(<AppRequest>req, form.errors,applicationTypeOption);
    if (form.hasErrors()) {
      res.render(viewPath, { form, applicationType,cancelUrl, backLinkUrl });
    } else {
      await saveAgreementFromOtherParty(redisKey, claim, req.body.option);
      res.redirect(getAgreementFromOtherPartiesNextUrl(req, claim));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default agreementFromOtherPartyController;
