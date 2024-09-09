import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  APPLY_HELP_WITH_FEES,
  APPLY_HELP_WITH_FEES_START,
  DASHBOARD_CLAIMANT_URL,
  HEARING_FEE_APPLY_HELP_FEE_SELECTION,
} from '../../urls';
import {AppRequest} from 'models/AppRequest';
import {GenericForm} from 'form/models/genericForm';
import {getClaimById} from 'modules/utilityService';
import {getApplyHelpWithFeesContent} from 'services/features/helpWithFees/applyHelpWithFeesService';
import {GenericYesNo} from 'form/models/genericYesNo';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {YesNo} from 'form/models/yesNo';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {generateRedisKey, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {t} from 'i18next';

const applyHelpWithFeesController = Router();
const applyHelpWithFeesViewPath  = 'features/helpWithFees/help-fees-start';
const hearingFeeBackUrl = HEARING_FEE_APPLY_HELP_FEE_SELECTION;

applyHelpWithFeesController.get(APPLY_HELP_WITH_FEES, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await getClaimById(claimId, <AppRequest>req, true);
    const form = new GenericForm(new GenericYesNo(claim?.helpWithFeesRequested, t('ERRORS.VALID_YES_NO_SELECTION_UPPER', {lng})));
    let backLinkUrl;
    if(claim.feeTypeHelpRequested === FeeType.HEARING){
      backLinkUrl = constructResponseUrlWithIdParams(req.params.id, hearingFeeBackUrl);
    }
    const cancelUrl = constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL);
    res.render(applyHelpWithFeesViewPath, {form, applyHelpWithFeesContent:getApplyHelpWithFeesContent(claimId, claim, lng), cancelUrl, backLinkUrl});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

applyHelpWithFeesController.post(APPLY_HELP_WITH_FEES, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, <AppRequest>req, true);
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const option = req.body.option;
    const form = new GenericForm(new GenericYesNo(option, t('ERRORS.VALID_YES_NO_SELECTION_UPPER', { lng })));
    await form.validate();
    if (form.hasErrors()) {
      res.render(applyHelpWithFeesViewPath, {form, applyHelpWithFeesContent:getApplyHelpWithFeesContent(claimId,claim,lng)});
    } else {
      let redirectUrl;
      if (req.body.option == YesNo.YES) {
        redirectUrl = constructResponseUrlWithIdParams(claimId, APPLY_HELP_WITH_FEES_START);
      } else if (claim.feeTypeHelpRequested === FeeType.HEARING) {
        redirectUrl = constructResponseUrlWithIdParams(claimId, hearingFeeBackUrl);
      }
      claim.helpWithFeesRequested = req.body.option;
      const redisKey = generateRedisKey(<AppRequest>req);
      await saveDraftClaim(redisKey, claim);
      res.redirect(redirectUrl);
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);
export default applyHelpWithFeesController;
