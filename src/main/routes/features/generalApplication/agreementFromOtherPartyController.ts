import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  APPLICATION_TYPE_URL,
  GA_AGREEMENT_FROM_OTHER_PARTY_URL,
  INFORM_OTHER_PARTIES_URL,
} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import { GenericYesNo } from 'common/form/models/genericYesNo';
import { generateRedisKey } from 'modules/draft-store/draftStoreService';
import { getClaimById } from 'modules/utilityService';
import { getCancelUrl, getLast, saveAgreementFromOtherParty, validateNoConsentOption} from 'services/features/generalApplication/generalApplicationService';
import {selectedApplicationType} from 'common/models/generalApplication/applicationType';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {agreementFromOtherPartyGuard} from 'routes/guards/generalApplication/agreementFromOtherPartyGuard';
import { GeneralApplication } from 'common/models/generalApplication/GeneralApplication';

const agreementFromOtherPartyController = Router();
const viewPath = 'features/generalApplication/agreement-from-other-party';

agreementFromOtherPartyController.get(GA_AGREEMENT_FROM_OTHER_PARTY_URL, agreementFromOtherPartyGuard, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const applicationId = req.params.appId;
    const backLinkUrl = getBackLinkUrl(<AppRequest>req);
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getClaimById(redisKey, req, true);
    const cancelUrl = await getCancelUrl(req.params.id, claim);
    const generalApplication = claim.generalApplications.find(a => a.id === applicationId) ?? new GeneralApplication();
    const applicationType = selectedApplicationType[getLast(generalApplication?.applicationTypes)?.option];
    const form = new GenericForm(new GenericYesNo(generalApplication?.agreementFromOtherParty));

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

agreementFromOtherPartyController.post(GA_AGREEMENT_FROM_OTHER_PARTY_URL, agreementFromOtherPartyGuard, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {

    const backLinkUrl = getBackLinkUrl(<AppRequest>req);
    const redisKey = generateRedisKey(<AppRequest>req);
    const applicationId = req.params.appId;
    const claim = await getClaimById(redisKey, req, true);
    const cancelUrl = await getCancelUrl(req.params.id, claim);
    const applicationTypeOption = getLast(claim.generalApplications.find(a => a.id === applicationId)?.applicationTypes)?.option;
    const applicationType = selectedApplicationType[applicationTypeOption];
    const form = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.GENERAL_APPLICATION.APPLICATION_FROM_OTHER_PARTY_EMPTY_OPTION'));

    form.validateSync();

    // Validate No option for application type Settle by Consent
    validateNoConsentOption(<AppRequest>req, form.errors,applicationTypeOption);
    if (form.hasErrors()) {
      res.render(viewPath, { form, applicationType,cancelUrl, backLinkUrl });
    } else {
      await saveAgreementFromOtherParty(redisKey, applicationId, claim, req.body.option);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, INFORM_OTHER_PARTIES_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

function getBackLinkUrl(req: AppRequest) : string {
  return constructResponseUrlWithIdParams(req.params.id, APPLICATION_TYPE_URL);
}

export default agreementFromOtherPartyController;
