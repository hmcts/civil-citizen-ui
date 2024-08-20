import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  GA_APPLY_HELP_WITH_FEE_SELECTION,
  GA_APPLY_HELP_WITH_OUT_APPID_FEE_SELECTION, GA_VIEW_APPLICATION_URL,
  GENERAL_APPLICATION_CONFIRM_URL,
} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdAndAppIdParams, constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericYesNo} from 'form/models/genericYesNo';
import {Claim} from 'models/claim';
import {getRedirectUrl} from 'services/features/generalApplication/fee/helpWithFeeService';
import {getClaimById} from 'modules/utilityService';
import {t} from 'i18next';
import {AppRequest} from 'models/AppRequest';
import {getHelpApplicationFeeSelectionPageContents, getButtonsContents}
  from 'services/features/generalApplication/applicationFee/helpWithApplicationFeeContent';
import {saveHelpWithFeesDetails} from 'services/features/generalApplication/generalApplicationService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {getGaAppId} from 'services/features/generalApplication/feeDetailsService';

const applyHelpWithApplicationFeeViewPath  = 'features/generalApplication/applicationFee/help-with-application-fee';
const helpWithApplicationFeeController = Router();
const hwfPropertyName = 'applyHelpWithFees';

async function renderView(res: Response, req: AppRequest | Request, form: GenericForm<GenericYesNo>, claimId: string, lng: string) {
  if (!form) {
    const claim: Claim = await getClaimById(claimId, req, true);
    form = new GenericForm(new GenericYesNo(claim.generalApplication?.helpWithFees?.applyHelpWithFees));
  }
  const backLinkUrl = req.query.id ? constructResponseUrlWithIdParams(claimId, GENERAL_APPLICATION_CONFIRM_URL) + '?id=' + req.query.id : constructResponseUrlWithIdAndAppIdParams(claimId, req.params.appId, GA_VIEW_APPLICATION_URL);
  res.render(applyHelpWithApplicationFeeViewPath,
    {
      form,
      backLinkUrl,
      applyHelpWithFeeSelectionContents: getHelpApplicationFeeSelectionPageContents(lng),
      applyHelpWithFeeSelectionButtonContents: getButtonsContents(claimId),
    });
}

helpWithApplicationFeeController.get([GA_APPLY_HELP_WITH_FEE_SELECTION, GA_APPLY_HELP_WITH_OUT_APPID_FEE_SELECTION], (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    await renderView(res, req, null, claimId, lng);
  }catch (error) {
    next(error);
  }
}) as RequestHandler);

helpWithApplicationFeeController.post([GA_APPLY_HELP_WITH_FEE_SELECTION, GA_APPLY_HELP_WITH_OUT_APPID_FEE_SELECTION], (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const genAppId = await getGaAppId(claimId, <AppRequest>req);
    const form = new GenericForm(new GenericYesNo(req.body.option, t('ERRORS.VALID_YES_NO_SELECTION_UPPER', { lng })));
    await form.validate();
    if (form.hasErrors()) {
      await renderView(res, req, form, claimId, lng);
    } else {
      const redisKey = generateRedisKey(<AppRequest>req);
      await saveHelpWithFeesDetails(redisKey, req.body.option, hwfPropertyName);
      const redirectUrl = await getRedirectUrl(claimId, genAppId, form.model, <AppRequest>req);
      res.redirect(redirectUrl);
    }
  }catch (error) {
    next(error);
  }
}) as RequestHandler);
export default helpWithApplicationFeeController;
