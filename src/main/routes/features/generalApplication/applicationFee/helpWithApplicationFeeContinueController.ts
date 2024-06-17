import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  DASHBOARD_CLAIMANT_URL,
  GA_APPLY_HELP_WITH_FEE_SELECTION,
  GA_APPLY_HELP_WITH_FEES,
  GA_APPLY_HELP_WITH_FEES_START,
} from '../../../urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {getClaimById} from 'modules/utilityService';
import {GenericYesNo} from 'form/models/genericYesNo';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {YesNo} from 'form/models/yesNo';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {t} from 'i18next';
import {Claim} from 'models/claim';
import {gaApplicationFeeDetails} from 'services/features/generalApplication/feeDetailsService';
import {getButtonsContents, getHelpApplicationFeeContinuePageContents}
  from 'services/features/generalApplication/applicationFee/helpWithApplicationFeeContent';
import {saveHelpWithFeesDetails} from 'services/features/generalApplication/generalApplicationService';

const helpWithApplicationFeeContinueController = Router();
const applyHelpWithFeesViewPath  = 'features/generalApplication/applicationFee/help-with-application-fee-continue';
const hwfPropertyName = 'helpWithFeesRequested';

async function renderView(res: Response, req: AppRequest | Request, form: GenericForm<GenericYesNo>, claimId: string) {
  const claim: Claim = await getClaimById(claimId, req, true);
  const gaFeeData = await gaApplicationFeeDetails(claim, <AppRequest>req);
  const cancelUrl = constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL);
  const backLinkUrl = constructResponseUrlWithIdParams(req.params.id, GA_APPLY_HELP_WITH_FEE_SELECTION);
  if (!form) {
    form = new GenericForm(new GenericYesNo(claim.generalApplication?.helpWithFees?.helpWithFeesRequested));
  }
  res.render(applyHelpWithFeesViewPath,{
    form,
    backLinkUrl,
    cancelUrl,
    applyHelpWithFeeContinueContents : getHelpApplicationFeeContinuePageContents(gaFeeData),
    applyHelpWithFeeContinueButtonContents: getButtonsContents(claimId),
  });
}

helpWithApplicationFeeContinueController.get(GA_APPLY_HELP_WITH_FEES, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    await renderView(res, req, null, claimId);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

helpWithApplicationFeeContinueController.post(GA_APPLY_HELP_WITH_FEES, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const form = new GenericForm(new GenericYesNo(req.body.option, t('ERRORS.VALID_YES_NO_SELECTION_UPPER', { lng })));
    await form.validate();
    if (form.hasErrors()) {
      await renderView(res, req, form, claimId);
    } else {
      await saveHelpWithFeesDetails(generateRedisKey(req as unknown as AppRequest), req.body.option, hwfPropertyName);
      res.redirect(getRedirectUrl(claimId, form.model));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);
export default helpWithApplicationFeeContinueController;

function getRedirectUrl(claimId: string, isHWFContinue: GenericYesNo): string {
  if (isHWFContinue.option === YesNo.YES) {
    return constructResponseUrlWithIdParams(claimId, GA_APPLY_HELP_WITH_FEES_START);
  }
  return constructResponseUrlWithIdParams(claimId, GA_APPLY_HELP_WITH_FEE_SELECTION);
}
