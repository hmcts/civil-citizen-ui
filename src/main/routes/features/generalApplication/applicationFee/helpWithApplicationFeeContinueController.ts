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
import {generateRedisKey, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {t} from 'i18next';
import {Claim} from 'models/claim';
import {gaApplicationFeeDetails} from 'services/features/generalApplication/feeDetailsService';
import {
  getButtonsContents,getHelpWithApplicationFeeContinueContent,
} from 'services/features/generalApplication/applicationFee/helpWithApplicationFeeContent';

const helpWithApplicationFeeContinueController = Router();
const applyHelpWithFeesViewPath  = 'features/generalApplication/applicationFee/help-with-application-fee-continue';

async function renderView(res: Response, req: AppRequest | Request, form: GenericForm<GenericYesNo>, claimId: string, lng: string) {
  const claim: Claim = await getClaimById(claimId, req, true);
  const gaFeeData = await gaApplicationFeeDetails(claim, <AppRequest>req);
  const cancelUrl = constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL);
  const backLinkUrl = constructResponseUrlWithIdParams(req.params.id, GA_APPLY_HELP_WITH_FEE_SELECTION);
  const feeType = claim.generalApplication?.feeTypeHelpRequested;
  if (!form) {
    const option = claim.generalApplication?.helpWithFeesRequested;
    form = new GenericForm(new GenericYesNo(option, t('ERRORS.VALID_YES_NO_SELECTION_UPPER', { lng })));
  }
  res.render(applyHelpWithFeesViewPath,{
    form,
    applyHelpWithFeeContinueContents : getHelpWithApplicationFeeContinueContent(gaFeeData),
    applyHelpWithFeeContinueButtonContents: getButtonsContents(claimId),
    cancelUrl,
    backLinkUrl,
    feeType,
  });
}

helpWithApplicationFeeContinueController.get(GA_APPLY_HELP_WITH_FEES, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    await renderView(res, req, null, claimId, lng);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

helpWithApplicationFeeContinueController.post(GA_APPLY_HELP_WITH_FEES, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, <AppRequest>req, true);
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const option = req.body.option;
    const form = new GenericForm(new GenericYesNo(option, t('ERRORS.VALID_YES_NO_SELECTION_UPPER', { lng })));
    await form.validate();
    if (form.hasErrors()) {
      await renderView(res, req, form, claimId, lng);
    } else {
      let redirectUrl;
      if (req.body.option == YesNo.YES) {
        redirectUrl = constructResponseUrlWithIdParams(claimId, GA_APPLY_HELP_WITH_FEES_START);
      } else {
        redirectUrl = constructResponseUrlWithIdParams(claimId, GA_APPLY_HELP_WITH_FEE_SELECTION);
      }
      claim.generalApplication.helpWithFeesRequested = req.body.option;
      const redisKey = generateRedisKey(<AppRequest>req);
      await saveDraftClaim(redisKey, claim);
      res.redirect(redirectUrl);
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);
export default helpWithApplicationFeeContinueController;
