import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  DASHBOARD_CLAIMANT_URL, GA_APPLICATION_FEE_CONFIRMATION_URL,
  GA_APPLY_HELP_WITH_FEE_REFERENCE, GA_APPLY_HELP_WITH_FEE_SELECTION,
  GA_APPLY_HELP_WITH_FEES_START,
  GENERIC_HELP_FEES_URL,
} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';

import {constructResponseUrlWithIdAndAppIdParams, constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'models/AppRequest';
import {generateRedisKeyForGA} from 'modules/draft-store/draftStoreService';
import {ApplyHelpFeesReferenceForm} from 'form/models/caseProgression/hearingFee/applyHelpFeesReferenceForm';
import {YesNo} from 'form/models/yesNo';
import {
  saveAndTriggerNotifyGaHwfEvent,
  saveHelpWithFeesDetails,
} from 'services/features/generalApplication/generalApplicationService';
import {getHelpWithApplicationFeeReferenceContents,getButtonsContents}
  from 'services/features/generalApplication/applicationFee/helpWithFeeReferenceContents';
import {GenericYesNo} from 'form/models/genericYesNo';
import {getDraftGAHWFDetails} from 'modules/draft-store/gaHwFeesDraftStore';
import {ValidationError} from 'class-validator';

const applyHelpWithFeeReferenceViewPath  = 'features/generalApplication/applicationFee/help-with-application-fee-reference';
const helpWithApplicationFeeReferenceController: Router = Router();
const hwfPropertyName = 'helpFeeReferenceNumberForm';

async function renderView(res: Response, req: AppRequest | Request, form: GenericForm<ApplyHelpFeesReferenceForm>, claimId: string, redirectUrl: string, feeTypeFlag: boolean) {
  const gaHwFDetails = await getDraftGAHWFDetails(generateRedisKeyForGA(<AppRequest>req));
  if (!form.hasErrors()) {
    form = new GenericForm(gaHwFDetails?.helpFeeReferenceNumberForm);
  }
  const backLinkUrl = constructResponseUrlWithIdAndAppIdParams(req.params.id, req.params.appId, GA_APPLY_HELP_WITH_FEES_START + '?additionalFeeTypeFlag='+ feeTypeFlag);
  const genericHelpFeeUrl : string = GENERIC_HELP_FEES_URL;
  res.render(applyHelpWithFeeReferenceViewPath,
    {
      form,
      backLinkUrl,
      genericHelpFeeUrl,
      redirectUrl,
      applyHelpWithFeeReferenceContents: getHelpWithApplicationFeeReferenceContents(feeTypeFlag),
      applyHelpWithFeeReferenceButtonContents: getButtonsContents(claimId, req.params.appId),
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
    const genAppId = req.params.appId;
    const form = new GenericForm(new ApplyHelpFeesReferenceForm(req.body.option, req.body.referenceNumber));
    await form.validate();
    if (form.hasErrors()) {
      if (isAdditionalFeeType) {
        replaceErrorConstraintsForAdditionFee(form.errors);
      }
      const redirectUrl = constructResponseUrlWithIdParams(claimId, GA_APPLY_HELP_WITH_FEE_REFERENCE+ '?additionalFeeTypeFlag='+ isAdditionalFeeType);
      await renderView(res, req, form, claimId, redirectUrl, isAdditionalFeeType);
    } else {
      const redisKey = generateRedisKeyForGA(<AppRequest>req);
      await saveHelpWithFeesDetails(redisKey, new ApplyHelpFeesReferenceForm(req.body.option, req.body.referenceNumber), hwfPropertyName);

      if (form.model.option === YesNo.YES) {
        await saveAndTriggerNotifyGaHwfEvent(<AppRequest>req, form.model);
      }
      res.redirect(getRedirectUrl(claimId, form.model, isAdditionalFeeType, genAppId));
    }
  }catch (error) {
    next(error);
  }
})as RequestHandler);
export default helpWithApplicationFeeReferenceController;

function getRedirectUrl(claimId: string, isHelpWithFee: GenericYesNo, feeType: boolean, genAppId: string): string {
  if (isHelpWithFee.option === YesNo.YES) {
    return constructResponseUrlWithIdAndAppIdParams(claimId, genAppId, GA_APPLICATION_FEE_CONFIRMATION_URL + '?additionalFeeTypeFlag=' + feeType);
  }
  return constructResponseUrlWithIdAndAppIdParams(claimId, genAppId, GA_APPLY_HELP_WITH_FEE_SELECTION  + '?additionalFeeTypeFlag='+ feeType );
}

function replaceErrorConstraintsForAdditionFee(data: ValidationError[]): void {
  data.forEach(item => {
    const constraints = item.constraints;
    for (let key in constraints) {
      if (constraints[key] === "ERRORS.VALID_ENTER_REFERENCE_NUMBER") {
        constraints[key] = "PAGES.GENERAL_APPLICATION.PAY_ADDITIONAL_FEE.VALID_ENTER_REFERENCE_NUMBER";
      }
    }
  });
}
