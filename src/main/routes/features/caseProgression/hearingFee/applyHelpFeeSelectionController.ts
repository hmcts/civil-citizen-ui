import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  DASHBOARD_CLAIMANT_URL,
  HEARING_FEE_APPLY_HELP_FEE_SELECTION, HEARING_FEE_CANCEL_JOURNEY,
  PAY_HEARING_FEE_URL,
} from 'routes/urls';
import {
  getApplyHelpFeeSelectionContents,
} from 'services/features/caseProgression/hearingFee/applyHelpFeeSelectionContents';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericYesNo} from 'form/models/genericYesNo';
import {deleteDraftClaimFromStore, generateRedisKey} from 'modules/draft-store/draftStoreService';
import {getButtonsContents} from 'services/features/caseProgression/hearingFee/applyHelpFeeSelectionButtonContents';
import {Claim} from 'models/claim';
import {getRedirectUrl} from 'services/features/caseProgression/hearingFee/applyHelpFeeSelectionService';
import {getClaimById} from 'modules/utilityService';
import {t} from 'i18next';
import {AppRequest} from 'models/AppRequest';

const applyHelpFeeSelectionViewPath  = 'features/caseProgression/hearingFee/apply-help-fee-selection';
const applyHelpFeeSelectionController: Router = Router();

async function renderView(res: Response, req: AppRequest | Request, form: GenericForm<GenericYesNo>, claimId: string, redirectUrl: string, lng: string) {
  let claim: Claim = await getClaimById(claimId, req, true);
  if (!claim.caseProgressionHearing?.hearingFeeInformation?.hearingFee) {
    const redisKey = generateRedisKey(<AppRequest>req);
    await deleteDraftClaimFromStore(redisKey);
    claim = await getClaimById(claimId, req, true);
  }
  if (!form) {
    form = new GenericForm(new GenericYesNo(null, t('ERRORS.VALID_YES_NO_SELECTION_UPPER', { lng })));
    if(claim.caseProgression?.hearingFeeHelpSelection)
    {
      form = new GenericForm(claim.caseProgression.hearingFeeHelpSelection);
    }
  }
  const backLinkUrl = constructResponseUrlWithIdParams(claimId, PAY_HEARING_FEE_URL);
  res.render(applyHelpFeeSelectionViewPath,
    {
      redirectUrl,
      form,
      backLinkUrl,
      applyHelpFeeSelectionContents: getApplyHelpFeeSelectionContents(lng,claimId,claim.totalClaimAmount),
      applyHelpFeeSelectionButtonContents: getButtonsContents(claimId),
    });
}

applyHelpFeeSelectionController.get(HEARING_FEE_APPLY_HELP_FEE_SELECTION, (async (req, res, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const redirectUrl = constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL);
    await renderView(res, req, null, claimId, redirectUrl, lng);
  }catch (error) {
    next(error);
  }
}) as RequestHandler);

applyHelpFeeSelectionController.post(HEARING_FEE_APPLY_HELP_FEE_SELECTION, (async (req:any, res,next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const form = new GenericForm(new GenericYesNo(req.body.option, t('ERRORS.VALID_YES_NO_SELECTION_UPPER', { lng })));
    form.validateSync();
    await form.validate();
    if (form.hasErrors()) {
      const redirectUrl = constructResponseUrlWithIdParams(claimId, HEARING_FEE_CANCEL_JOURNEY);
      await renderView(res, req, form, claimId, redirectUrl, lng);
    } else {
      const redirectUrl = await getRedirectUrl(claimId, form.model, req);
      res.redirect(redirectUrl);
    }
  }catch (error) {
    next(error);
  }
}) as RequestHandler);

export default applyHelpFeeSelectionController;
