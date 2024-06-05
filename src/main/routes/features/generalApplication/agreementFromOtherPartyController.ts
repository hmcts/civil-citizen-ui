import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  APPLICATION_TYPE_URL,
  GA_AGREEMENT_FROM_OTHER_PARTY,
  INFORM_OTHER_PARTIES,
} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import { GenericYesNo } from 'common/form/models/genericYesNo';
import { generateRedisKey } from 'modules/draft-store/draftStoreService';
import { getClaimById } from 'modules/utilityService';
import { getCancelUrl, getLast, saveAgreementFromOtherParty, validateNoConsentOption} from 'services/features/generalApplication/generalApplicationService';
import {selectedApplicationType} from 'common/models/generalApplication/applicationType';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {agreementFromOtherPartyGuard} from "routes/guards/generalApplication/agreementFromOtherPartyGuard";

const agreementFromOtherPartyController = Router();
const viewPath = 'features/generalApplication/agreement-from-other-party';
//const options = [ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT, ApplicationTypeOption.SET_ASIDE_JUDGEMENT];

agreementFromOtherPartyController.get(GA_AGREEMENT_FROM_OTHER_PARTY, [agreementFromOtherPartyGuard], (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const backLinkUrl = getBackLinkUrl(<AppRequest>req);
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getClaimById(redisKey, req, true);
    const cancelUrl = await getCancelUrl(req.params.id, claim);
    const applicationType = selectedApplicationType[getLast(claim.generalApplication?.applicationTypes)?.option];
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

agreementFromOtherPartyController.post(GA_AGREEMENT_FROM_OTHER_PARTY, [agreementFromOtherPartyGuard], (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {

    const backLinkUrl = getBackLinkUrl(<AppRequest>req);
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getClaimById(redisKey, req, true);
    const cancelUrl = await getCancelUrl(req.params.id, claim);
    const applicationTypeOption = getLast(claim.generalApplication?.applicationTypes)?.option;
    const applicationType = selectedApplicationType[applicationTypeOption];
    const form = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.GENERAL_APPLICATION.APPLICATION_FROM_OTHER_PARTY_EMPTY_OPTION'));

    form.validateSync();

    // Validate No option for application type Settle by Consent
    validateNoConsentOption(<AppRequest>req, form.errors,applicationTypeOption);
    if (form.hasErrors()) {
      res.render(viewPath, { form, applicationType,cancelUrl, backLinkUrl });
    } else {
      await saveAgreementFromOtherParty(redisKey, claim, req.body.option);
      //res.redirect(getRedirectUrl(req.body.option, req.params.id, applicationTypeOption));
      res.redirect(constructResponseUrlWithIdParams(req.params.id, INFORM_OTHER_PARTIES));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

function getBackLinkUrl(req: AppRequest) : string {
  const claimId = req.params.id;
  return APPLICATION_TYPE_URL.replace(':id', claimId);
}

export default agreementFromOtherPartyController;
