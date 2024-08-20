import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  DASHBOARD_CLAIMANT_URL, GA_APPLICATION_FEE_CONFIRMATION_URL,
  GA_APPLY_HELP_WITH_FEE_REFERENCE, GA_APPLY_HELP_WITH_FEE_SELECTION,
  GA_APPLY_HELP_WITH_FEES_START,
  GENERIC_HELP_FEES_URL,
} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';

import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {ApplyHelpFeesReferenceForm} from 'form/models/caseProgression/hearingFee/applyHelpFeesReferenceForm';
import {YesNo} from 'form/models/yesNo';
import {getClaimById} from 'modules/utilityService';
import {
  saveAndTriggerNotifyGaHwfEvent,
  saveHelpWithFeesDetails,
} from 'services/features/generalApplication/generalApplicationService';
import {getHelpWithApplicationFeeReferenceContents,getButtonsContents}
  from 'services/features/generalApplication/applicationFee/helpWithFeeReferenceContents';
import {GenericYesNo} from 'form/models/genericYesNo';

const applyHelpWithFeeReferenceViewPath  = 'features/generalApplication/applicationFee/help-with-application-fee-reference';
const helpWithApplicationFeeReferenceController: Router = Router();
const hwfPropertyName = 'helpFeeReferenceNumberForm';

async function renderView(res: Response, req: AppRequest | Request, form: GenericForm<ApplyHelpFeesReferenceForm>, claimId: string, redirectUrl: string, feeTypeFlag: boolean) {
  const claim: Claim = await getClaimById(claimId, req, true);
  if (!form.hasErrors()) {
    form = new GenericForm(claim.generalApplication?.helpWithFees?.helpFeeReferenceNumberForm);
  }
  const backLinkUrl = constructResponseUrlWithIdParams(req.params.id, GA_APPLY_HELP_WITH_FEES_START+ '?additionalFeeTypeFlag='+ feeTypeFlag);
  const genericHelpFeeUrl : string = GENERIC_HELP_FEES_URL;
  res.render(applyHelpWithFeeReferenceViewPath,
    {
      form,
      backLinkUrl,
      genericHelpFeeUrl,
      redirectUrl,
      applyHelpWithFeeReferenceContents: getHelpWithApplicationFeeReferenceContents(feeTypeFlag),
      applyHelpWithFeeReferenceButtonContents: getButtonsContents(claimId),
    });
}

helpWithApplicationFeeReferenceController.get(GA_APPLY_HELP_WITH_FEE_REFERENCE, (async (req, res, next: NextFunction) => {
  try{
    const claimId = req.params.id;
    const isAdditionalFeeType = req.query.additionalFeeTypeFlag === 'true';
    const redirectUrl = constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL);
    await renderView(res, req, new GenericForm(new ApplyHelpFeesReferenceForm()), claimId, redirectUrl, isAdditionalFeeType);
  }catch (error) {
    next(error);
  }
}) as RequestHandler);

helpWithApplicationFeeReferenceController.post(GA_APPLY_HELP_WITH_FEE_REFERENCE, (async (req: AppRequest | Request, res: Response, next) => {
  try{

    const claimId = req.params.id;
    const isAdditionalFeeType = req.query.additionalFeeTypeFlag === 'true';
    const form = new GenericForm(new ApplyHelpFeesReferenceForm(req.body.option, req.body.referenceNumber));
    await form.validate();
    if (form.hasErrors()) {
      const redirectUrl = constructResponseUrlWithIdParams(claimId, GA_APPLY_HELP_WITH_FEE_REFERENCE+ '?additionalFeeTypeFlag='+ isAdditionalFeeType);
      await renderView(res, req, form, claimId, redirectUrl, false);
    } else {
      const redisKey = generateRedisKey(<AppRequest>req);
      await saveHelpWithFeesDetails(redisKey, new ApplyHelpFeesReferenceForm(req.body.option, req.body.referenceNumber), hwfPropertyName);

      if (form.model.option === YesNo.YES) {
        await saveAndTriggerNotifyGaHwfEvent(claimId, <AppRequest>req, form.model);
      }
      res.redirect(getRedirectUrl(claimId, form.model, isAdditionalFeeType));
    }
  }catch (error) {
    next(error);
  }
})as RequestHandler);
export default helpWithApplicationFeeReferenceController;

function getRedirectUrl(claimId: string, isHelpWithFee: GenericYesNo, feeType: boolean): string {
  if (isHelpWithFee.option === YesNo.YES) {
    return constructResponseUrlWithIdParams(claimId, GA_APPLICATION_FEE_CONFIRMATION_URL+ '?additionalFeeTypeFlag='+ feeType);
  }
  return constructResponseUrlWithIdParams(claimId, GA_APPLY_HELP_WITH_FEE_SELECTION+ '?additionalFeeTypeFlag='+ feeType);
}
