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
import {
  getApplicationIndex,
} from 'services/features/generalApplication/generalApplicationService';
import {getDraftGAHWFDetails} from 'modules/draft-store/gaHwFeesDraftStore';
import {generateRedisKey, generateRedisKeyForGA} from 'modules/draft-store/draftStoreService';
import {saveDraftClaim} from 'modules/draft-store/draftStoreService';

const applyHelpWithApplicationFeeViewPath  = 'features/generalApplication/applicationFee/help-with-application-fee';
const helpWithApplicationFeeController = Router();
const hwfPropertyName = 'applyHelpWithFees';

async function renderView(res: Response, req: AppRequest | Request, form: GenericForm<GenericYesNo>, claimId: string, lng: string) {
  let paymentSyncError = false;
  if (!form) {
    const gaHwFDetails = await getDraftGAHWFDetails(generateRedisKeyForGA(<AppRequest>req));
    const claim: Claim = await getClaimById(claimId, req, true);
    form = new GenericForm(new GenericYesNo(gaHwFDetails?.applyHelpWithFees?.option, t('ERRORS.GENERAL_APPLICATION.PAY_APPLICATION_FEE', { lng })));
    if (claim.paymentSyncError) {
      paymentSyncError = true;
      claim.paymentSyncError = undefined;
      await saveDraftClaim(generateRedisKey(<AppRequest>req), claim, true);
    }
  }
  let backLinkUrl;
  if (req.query.id) {
    backLinkUrl = constructResponseUrlWithIdParams(claimId, GENERAL_APPLICATION_CONFIRM_URL) + '?id=' + req.query.id + '&appFee=' + Number(req.query.appFee);
  } else {
    const index = await getApplicationIndex(claimId, req.params.appId, <AppRequest>req);
    backLinkUrl =`${constructResponseUrlWithIdAndAppIdParams(claimId, req.params.appId, GA_VIEW_APPLICATION_URL)}?index=${index + 1}`;
  }
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
    console.log('helpWithApplicationFeeController lng =>' + lng );
    const claimId = req.params.id;
    await renderView(res, req, null, claimId, lng);
  }catch (error) {
    next(error);
  }
}) as RequestHandler);

helpWithApplicationFeeController.post([GA_APPLY_HELP_WITH_FEE_SELECTION, GA_APPLY_HELP_WITH_OUT_APPID_FEE_SELECTION], (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    console.log('helpWithApplicationFeeController req.query.lang =>' + req.query.lang );
    console.log('helpWithApplicationFeeController req.cookies.lang =>' + req.cookies.lang );
    console.log('helpWithApplicationFeeController lng =>' + lng );

    const claimId = req.params.id;
    const form = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.GENERAL_APPLICATION.PAY_APPLICATION_FEE'));
    await form.validate();
    if (form.hasErrors()) {
      await renderView(res, req, form, claimId, lng);
    } else {
      const redirectUrl = await getRedirectUrl(claimId, form.model, hwfPropertyName, <AppRequest>req);
      console.log('redirectUrl =>' + redirectUrl );
      res.cookie('lang', lng, { httpOnly: true, secure: true });
      res.redirect(redirectUrl);
    }
  }catch (error) {
    next(error);
  }
}) as RequestHandler);
export default helpWithApplicationFeeController;
