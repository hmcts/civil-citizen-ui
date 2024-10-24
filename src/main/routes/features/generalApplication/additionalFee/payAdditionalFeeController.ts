import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {DASHBOARD_CLAIMANT_URL, GA_PAY_ADDITIONAL_FEE_URL, GA_APPLY_HELP_ADDITIONAL_FEE_SELECTION_URL} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdAndAppIdParams, constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericYesNo} from 'form/models/genericYesNo';
import {getRedirectUrl} from 'services/features/generalApplication/fee/helpWithFeeService';
import {t} from 'i18next';
import {AppRequest} from 'models/AppRequest';
import {getHelpAdditionalFeeSelectionPageContents, getButtonsContents}
  from 'services/features/generalApplication/additionalFee/helpWithAdditionalFeeContent';
import {getDraftGAHWFDetails} from 'modules/draft-store/gaHwFeesDraftStore';
import {generateRedisKeyForGA} from 'modules/draft-store/draftStoreService';

const applyHelpWithApplicationFeeViewPath  = 'features/generalApplication/additionalFee/help-with-additional-fee';
const payAdditionalFeeController = Router();
const hwfPropertyName = 'applyAdditionalHelpWithFees';

async function renderView(res: Response, req: AppRequest | Request, form: GenericForm<GenericYesNo>, claimId: string, redirectUrl: string, lng: string) {
  const appId = req.params.appId;
  if (!form) {
    const gaHwFDetails = await getDraftGAHWFDetails(generateRedisKeyForGA(<AppRequest>req));
    form = new GenericForm(new GenericYesNo(gaHwFDetails?.applyAdditionalHelpWithFees?.option, t('ERRORS.GENERAL_APPLICATION.PAY_APPLICATION_FEE', { lng })));
  }
  const backLinkUrl = constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_PAY_ADDITIONAL_FEE_URL);
  res.render(applyHelpWithApplicationFeeViewPath,
    {
      form,
      backLinkUrl,
      redirectUrl,
      applyHelpWithFeeSelectionContents: getHelpAdditionalFeeSelectionPageContents(lng),
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
    const form = new GenericForm(new GenericYesNo(req.body.option, t('ERRORS.GENERAL_APPLICATION.APPLY_HELP_WITH_FEES', { lng })));
    await form.validate();
    if (form.hasErrors()) {
      const redirectUrl = constructResponseUrlWithIdParams(claimId, GA_APPLY_HELP_ADDITIONAL_FEE_SELECTION_URL);
      await renderView(res, req, form, claimId, redirectUrl, lng);
    } else {
      const redirectUrl = await getRedirectUrl(claimId, form.model, hwfPropertyName, <AppRequest>req);
      res.redirect(redirectUrl);
    }
  }catch (error) {
    next(error);
  }
}) as RequestHandler);
export default payAdditionalFeeController;
