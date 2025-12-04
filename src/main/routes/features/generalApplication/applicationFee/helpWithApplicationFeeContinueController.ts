import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  DASHBOARD_CLAIMANT_URL, GA_APPLY_HELP_ADDITIONAL_FEE_SELECTION_URL,
  GA_APPLY_HELP_WITH_FEE_SELECTION,
  GA_APPLY_HELP_WITH_FEES,
  GA_APPLY_HELP_WITH_FEES_START,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {constructResponseUrlWithIdAndAppIdParams, constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {YesNo} from 'form/models/yesNo';
import {generateRedisKeyForGA} from 'modules/draft-store/draftStoreService';
import {t} from 'i18next';
import {getButtonsContents, getHelpApplicationFeeContinuePageContents}
  from 'services/features/generalApplication/applicationFee/helpWithApplicationFeeContent';
import {
  saveHelpWithFeesDetails,
} from 'services/features/generalApplication/generalApplicationService';
import {getDraftGAHWFDetails} from 'modules/draft-store/gaHwFeesDraftStore';

const helpWithApplicationFeeContinueController = Router();
const applyHelpWithFeesViewPath  = 'features/generalApplication/applicationFee/help-with-application-fee-continue';
const hwfPropertyName = 'helpWithFeesRequested';

async function renderView(res: Response, req: AppRequest | Request, form: GenericForm<GenericYesNo>, claimId: string, feeTypeFlag: boolean, lang: string) {
  const gaHwFDetails = await getDraftGAHWFDetails(generateRedisKeyForGA(<AppRequest>req));
  const cancelUrl = constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL);
  let backLinkUrl: string;

  if (feeTypeFlag) {
    backLinkUrl = constructResponseUrlWithIdAndAppIdParams(req.params.id,  req.params.appId, GA_APPLY_HELP_ADDITIONAL_FEE_SELECTION_URL + '?additionalFeeTypeFlag='+ feeTypeFlag);
  } else {
    backLinkUrl = constructResponseUrlWithIdAndAppIdParams(req.params.id, req.params.appId, GA_APPLY_HELP_WITH_FEE_SELECTION + '?additionalFeeTypeFlag='+ feeTypeFlag);
  }
  if (!form) {
    form = new GenericForm(new GenericYesNo(gaHwFDetails?.helpWithFeesRequested));
  }
  res.render(applyHelpWithFeesViewPath,{
    form,
    backLinkUrl,
    cancelUrl,
    applyHelpWithFeeContinueContents: getHelpApplicationFeeContinuePageContents(lang,feeTypeFlag ? gaHwFDetails.additionalFee : gaHwFDetails.applicationFee, feeTypeFlag),
    applyHelpWithFeeContinueButtonContents: getButtonsContents(claimId),
  });
}

helpWithApplicationFeeContinueController.get(GA_APPLY_HELP_WITH_FEES, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const isAdditionalFeeType = req.query.additionalFeeTypeFlag === 'true';
    await renderView(res, req, null, claimId, isAdditionalFeeType, lang);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

helpWithApplicationFeeContinueController.post(GA_APPLY_HELP_WITH_FEES, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const isAdditionalFeeType = req.query.additionalFeeTypeFlag === 'true';
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const genAppId = req.params.appId;
    const form = new GenericForm(new GenericYesNo(req.body.option, t('ERRORS.VALID_YES_NO_SELECTION_ALT', { lng })));
    await form.validate();
    if (form.hasErrors()) {
      await renderView(res, req, form, claimId, false, lang);
    } else {
      await saveHelpWithFeesDetails(generateRedisKeyForGA(<AppRequest>req), req.body.option, hwfPropertyName);
      res.redirect(getRedirectUrl(claimId, form.model, isAdditionalFeeType, genAppId));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);
export default helpWithApplicationFeeContinueController;

function getRedirectUrl(claimId: string, isHWFContinue: GenericYesNo, feeType: boolean, genAppId: string): string {
  if (isHWFContinue.option === YesNo.YES) {
    return constructResponseUrlWithIdAndAppIdParams(claimId, genAppId, GA_APPLY_HELP_WITH_FEES_START + '?additionalFeeTypeFlag=' + feeType);
  }
  return constructResponseUrlWithIdAndAppIdParams(claimId, genAppId, GA_APPLY_HELP_WITH_FEE_SELECTION);
}
