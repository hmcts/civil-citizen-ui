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
import {generateRedisKey, saveDraftClaim} from 'modules/draft-store/draftStoreService';

const applyHelpWithApplicationFeeViewPath  = 'features/generalApplication/applicationFee/help-with-application-fee';
const helpWithApplicationFeeController = Router();
const hwfPropertyName = 'applyHelpWithFees';

async function renderView(res: Response, req: AppRequest | Request, form: GenericForm<GenericYesNo>, claimId: string, lng: string) {
  let paymentSyncError = false;
  if (!form) {
    const claim: Claim = await getClaimById(claimId, req, true);
    form = new GenericForm(new GenericYesNo(claim.generalApplication?.helpWithFees?.applyHelpWithFees));
    if (claim.paymentSyncError) {
      paymentSyncError = true;
      claim.paymentSyncError = undefined;
      await saveDraftClaim(claim.id, claim);
    }
  }
  const backLinkUrl = req.query.id ? constructResponseUrlWithIdParams(claimId, GENERAL_APPLICATION_CONFIRM_URL) + '?id=' + req.query.id : constructResponseUrlWithIdAndAppIdParams(claimId, req.params.appId, GA_VIEW_APPLICATION_URL);
  res.render(applyHelpWithApplicationFeeViewPath,
    {
      form,
      backLinkUrl,
      applyHelpWithFeeSelectionContents: getHelpApplicationFeeSelectionPageContents(lng, paymentSyncError),
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
    const form = new GenericForm(new GenericYesNo(req.body.option, t('ERRORS.VALID_YES_NO_SELECTION_UPPER', { lng })));
    await form.validate();
    if (form.hasErrors()) {
      await renderView(res, req, form, claimId, lng);
    } else {
      const redisKey = generateRedisKey(<AppRequest>req);
      await saveHelpWithFeesDetails(redisKey, req.body.option, hwfPropertyName);
      const redirectUrl = await getRedirectUrl(claimId, form.model, <AppRequest>req, false);
      res.redirect(redirectUrl);
    }
  }catch (error) {
    next(error);
  }
}) as RequestHandler);
export default helpWithApplicationFeeController;
