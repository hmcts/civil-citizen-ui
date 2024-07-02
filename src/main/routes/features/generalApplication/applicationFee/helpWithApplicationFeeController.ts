import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {DASHBOARD_CLAIMANT_URL, GA_APPLY_HELP_WITH_FEE_SELECTION} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericYesNo} from 'form/models/genericYesNo';
import {Claim} from 'models/claim';
import {getRedirectUrl} from 'services/features/generalApplication/applicationFee/helpWithApplicationFeeService';
import {getClaimById} from 'modules/utilityService';
import {t} from 'i18next';
import {AppRequest} from 'models/AppRequest';
import {getHelpApplicationFeeSelectionPageContents, getButtonsContents}
  from 'services/features/generalApplication/applicationFee/helpWithApplicationFeeContent';
import {saveHelpWithFeesDetails} from 'services/features/generalApplication/generalApplicationService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';

const applyHelpWithApplicationFeeViewPath  = 'features/generalApplication/applicationFee/help-with-application-fee';
const helpWithApplicationFeeController = Router();
const hwfPropertyName = 'applyHelpWithFees';
const backLinkUrl = 'test'; // TODO: add url
async function renderView(res: Response, req: AppRequest | Request, form: GenericForm<GenericYesNo>, claimId: string, redirectUrl: string, lng: string) {
  if (!form) {
    const claim: Claim = await getClaimById(claimId, req, true);
    form = new GenericForm(new GenericYesNo(claim.generalApplication?.helpWithFees?.applyHelpWithFees));
  }
  res.render(applyHelpWithApplicationFeeViewPath,
    {
      form,
      backLinkUrl,
      redirectUrl,
      applyHelpWithFeeSelectionContents: getHelpApplicationFeeSelectionPageContents(lng),
      applyHelpWithFeeSelectionButtonContents: getButtonsContents(claimId),
    });
}

helpWithApplicationFeeController.get(GA_APPLY_HELP_WITH_FEE_SELECTION, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const redirectUrl = constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL);
    await renderView(res, req, null, claimId, redirectUrl, lng);
  }catch (error) {
    next(error);
  }
}) as RequestHandler);

helpWithApplicationFeeController.post(GA_APPLY_HELP_WITH_FEE_SELECTION, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const form = new GenericForm(new GenericYesNo(req.body.option, t('ERRORS.VALID_YES_NO_SELECTION_UPPER', { lng })));
    await form.validate();
    if (form.hasErrors()) {
      const redirectUrl = constructResponseUrlWithIdParams(claimId, GA_APPLY_HELP_WITH_FEE_SELECTION);
      await renderView(res, req, form, claimId, redirectUrl, lng);
    } else {
      const redisKey = generateRedisKey(<AppRequest>req);
      await saveHelpWithFeesDetails(redisKey, req.body.option, hwfPropertyName);
      const genAppId = req.query.id as string;
      const redirectUrl = await getRedirectUrl(claimId, genAppId, form.model, <AppRequest>req);
      res.redirect(redirectUrl);
    }
  }catch (error) {
    next(error);
  }
}) as RequestHandler);
export default helpWithApplicationFeeController;
