import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  GA_APPLY_HELP_WITH_FEE_SELECTION,
  GA_APPLY_HELP_WITH_OUT_APPID_FEE_SELECTION, GA_VIEW_APPLICATION_URL,
  GENERAL_APPLICATION_CONFIRM_URL,
} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdAndAppIdParams, constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericYesNo} from 'form/models/genericYesNo';
import {getRedirectUrl} from 'services/features/generalApplication/fee/helpWithFeeService';
import {t} from 'i18next';
import {AppRequest} from 'models/AppRequest';
import {getHelpApplicationFeeSelectionPageContents, getButtonsContents}
  from 'services/features/generalApplication/applicationFee/helpWithApplicationFeeContent';
import {
  getApplicationIndex,
} from 'services/features/generalApplication/generalApplicationService';
import {getDraftGAHWFDetails} from 'modules/draft-store/gaHwFeesDraftStore';
import {generateRedisKeyForGA} from 'modules/draft-store/draftStoreService';

const applyHelpWithApplicationFeeViewPath  = 'features/generalApplication/applicationFee/help-with-application-fee';
const helpWithApplicationFeeController = Router();
const hwfPropertyName = 'applyHelpWithFees';

async function renderView(res: Response, req: AppRequest | Request, form: GenericForm<GenericYesNo>, claimId: string, lng: string) {
  if (!form) {
    const gaHwFDetails = await getDraftGAHWFDetails(generateRedisKeyForGA(<AppRequest>req));
    form = new GenericForm(new GenericYesNo(gaHwFDetails?.applyHelpWithFees?.option));
  }
  let backLinkUrl;
  if (req.query.id) {
    backLinkUrl = constructResponseUrlWithIdParams(claimId, GENERAL_APPLICATION_CONFIRM_URL) + '?id=' + req.query.id;
  } else {
    const index = await getApplicationIndex(claimId, req.params.appId, <AppRequest>req);
    backLinkUrl =`${constructResponseUrlWithIdAndAppIdParams(claimId, req.params.appId, GA_VIEW_APPLICATION_URL)}?index=${index + 1}`;
  }
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
    const form = new GenericForm(new GenericYesNo(req.body.option, t('ERRORS.VALID_YES_NO_SELECTION_UPPER', { lng })));
    await form.validate();
    if (form.hasErrors()) {
      await renderView(res, req, form, claimId, lng);
    } else {
      const redirectUrl = await getRedirectUrl(claimId, form.model, hwfPropertyName, <AppRequest>req);
      res.redirect(redirectUrl);
    }
  }catch (error) {
    next(error);
  }
}) as RequestHandler);
export default helpWithApplicationFeeController;
