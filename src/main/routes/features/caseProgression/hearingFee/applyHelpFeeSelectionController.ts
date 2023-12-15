import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  APPLY_HELP_WITH_FEES,
  DASHBOARD_CLAIMANT_URL,
  HEARING_FEE_APPLY_HELP_FEE_SELECTION, HEARING_FEE_CANCEL_JOURNEY,
  HEARING_FEE_PAYMENT_CREATION, PAY_HEARING_FEE_URL,
} from 'routes/urls';
import {
  getApplyHelpFeeSelectionContents,
} from 'services/features/caseProgression/hearingFee/applyHelpFeeSelectionContents';
import {GenericForm} from 'form/models/genericForm';
import {YesNo} from 'form/models/yesNo';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericYesNo} from 'form/models/genericYesNo';
import {deleteDraftClaimFromStore, generateRedisKey, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {getButtonsContents} from 'services/features/caseProgression/hearingFee/applyHelpFeeSelectionButtonContents';
import {saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';
import {Claim} from 'models/claim';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {getClaimById} from 'modules/utilityService';

const applyHelpFeeSelectionViewPath  = 'features/caseProgression/hearingFee/apply-help-fee-selection';
const applyHelpFeeSelectionController: Router = Router();

async function renderView(res: Response, req: any, form: any, claimId: string, redirectUrl: string) {
  let claim: Claim = await getClaimById(claimId, req, true);
  if (!claim.caseProgressionHearing?.hearingFeeInformation?.hearingFee) {
    const redisKey = generateRedisKey(req);
    await deleteDraftClaimFromStore(redisKey);
    claim = await getClaimById(claimId, req, true);
  }
  if (!form) {
    form = new GenericForm(new GenericYesNo(null, 'ERRORS.VALID_YES_NO_SELECTION_UPPER'));
    if(claim.caseProgression?.hearingFeeHelpSelection)
    {
      form = new GenericForm(claim.caseProgression.hearingFeeHelpSelection);
    }
  }
  const startPayHearingFee = constructResponseUrlWithIdParams(req.params.id, PAY_HEARING_FEE_URL);
  res.render(applyHelpFeeSelectionViewPath,
    {
      redirectUrl,
      form,
      startPayHearingFee,
      applyHelpFeeSelectionContents: getApplyHelpFeeSelectionContents(),
      applyHelpFeeSelectionButtonContents: getButtonsContents(claimId),
    });
}

applyHelpFeeSelectionController.get(HEARING_FEE_APPLY_HELP_FEE_SELECTION, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const redirectUrl = constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL);
    await renderView(res, req, null, claimId, redirectUrl);
  }catch (error) {
    next(error);
  }
}) as RequestHandler);

applyHelpFeeSelectionController.post(HEARING_FEE_APPLY_HELP_FEE_SELECTION, (async (req:any, res) => {
  const claimId = req.params.id;
  const form = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.VALID_YES_NO_SELECTION_UPPER'));
  form.validateSync();
  await form.validate();
  if (form.hasErrors()) {
    const redirectUrl = constructResponseUrlWithIdParams(claimId, HEARING_FEE_CANCEL_JOURNEY);
    await renderView(res, req, form, claimId, redirectUrl);
  } else {
    const claim: any = await getClaimById(claimId, req, true);
    const redisKey = generateRedisKey(req);
    claim.feeTypeHelpRequested = FeeType.HEARING;
    await saveDraftClaim(redisKey, claim);
    const redirectUrl = form.model.option === YesNo.NO ? HEARING_FEE_PAYMENT_CREATION : APPLY_HELP_WITH_FEES;
    await saveCaseProgression(redisKey, form.model, 'hearingFeeHelpSelection');
    res.redirect(constructResponseUrlWithIdParams(claimId, redirectUrl));
  }
})as RequestHandler);

export default applyHelpFeeSelectionController;

