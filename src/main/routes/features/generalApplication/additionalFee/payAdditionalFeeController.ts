import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {DASHBOARD_CLAIMANT_URL, GA_PAY_ADDITIONAL_FEE_URL, GA_APPLY_HELP_ADDITIONAL_FEE_SELECTION_URL} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdAndAppIdParams, constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericYesNo} from 'form/models/genericYesNo';
import {Claim} from 'models/claim';
import {getRedirectUrl} from 'services/features/generalApplication/fee/helpWithFeeService';
import {getClaimById} from 'modules/utilityService';
import {t} from 'i18next';
import {AppRequest} from 'models/AppRequest';
import {getHelpAdditionalFeeSelectionPageContents, getButtonsContents}
  from 'services/features/generalApplication/additionalFee/helpWithAdditionalFeeContent';
import {saveHelpWithFeesDetails} from 'services/features/generalApplication/generalApplicationService';
import {generateRedisKey, saveDraftClaim} from 'modules/draft-store/draftStoreService';

const applyHelpWithApplicationFeeViewPath  = 'features/generalApplication/additionalFee/help-with-additional-fee';
const payAdditionalFeeController = Router();
const hwfPropertyName = 'applyAdditionalHelpWithFees';

async function renderView(res: Response, req: AppRequest | Request, form: GenericForm<GenericYesNo>, claimId: string, redirectUrl: string, lng: string) {
  const appId = req.params.appId;
  let paymentSyncError = false;
  if (!form) {
    const claim: Claim = await getClaimById(claimId, req, true);
    form = new GenericForm(new GenericYesNo(claim.generalApplication?.helpWithFees?.applyAdditionalHelpWithFees));
    if (claim.paymentSyncError) {
      paymentSyncError = true;
      claim.paymentSyncError = undefined;
      await saveDraftClaim(claim.id, claim);
    }
  }
  const backLinkUrl = constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_PAY_ADDITIONAL_FEE_URL);
  res.render(applyHelpWithApplicationFeeViewPath,
    {
      form,
      backLinkUrl,
      redirectUrl,
      applyHelpWithFeeSelectionContents: getHelpAdditionalFeeSelectionPageContents(lng, paymentSyncError),
      applyHelpWithFeeSelectionButtonContents: getButtonsContents(claimId),
    });
}

payAdditionalFeeController.get(GA_APPLY_HELP_ADDITIONAL_FEE_SELECTION_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const redirectUrl = constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL);
    await renderView(res, req, null, claimId, redirectUrl, lng);
  }catch (error) {
    next(error);
  }
}) as RequestHandler);

payAdditionalFeeController.post(GA_APPLY_HELP_ADDITIONAL_FEE_SELECTION_URL, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const form = new GenericForm(new GenericYesNo(req.body.option, t('ERRORS.VALID_YES_NO_SELECTION_UPPER', { lng })));
    await form.validate();
    if (form.hasErrors()) {
      const redirectUrl = constructResponseUrlWithIdParams(claimId, GA_APPLY_HELP_ADDITIONAL_FEE_SELECTION_URL);
      await renderView(res, req, form, claimId, redirectUrl, lng);
    } else {
      const redisKey = generateRedisKey(<AppRequest>req);
      await saveHelpWithFeesDetails(redisKey, req.body.option, hwfPropertyName);
      const redirectUrl = await getRedirectUrl(claimId, form.model, <AppRequest>req, true);
      res.redirect(redirectUrl);
    }
  }catch (error) {
    next(error);
  }
}) as RequestHandler);
export default payAdditionalFeeController;
