import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  APPLY_HELP_WITH_FEES_START,
  DASHBOARD_CLAIMANT_URL,
  HEARING_FEE_APPLY_HELP_FEE_SELECTION, HEARING_FEE_CANCEL_JOURNEY,
  HEARING_FEE_PAYMENT_CREATION,
} from 'routes/urls';
import {
  getApplyHelpFeeSelectionContents,
} from 'services/features/caseProgression/hearingFee/applyHelpFeeSelectionContents';
import {GenericForm} from 'form/models/genericForm';
import {YesNo} from 'form/models/yesNo';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {ApplyHelpFeeForm} from 'models/caseProgression/hearingFee/applyHelpFeeForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {AppRequest} from 'models/AppRequest';
import {generateRedisKey, getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {getButtonsContents} from 'services/features/caseProgression/hearingFee/applyHelpFeeSelectionButtonContents';

const applyHelpFeeSelectionViewPath  = 'features/caseProgression/hearingFee/apply-help-fee-selection';
const applyHelpFeeSelectionController: Router = Router();

async function renderView(res: Response, claimId: string, form: any, redirectUrl: string) {

  res.render(applyHelpFeeSelectionViewPath,
    {
      redirectUrl,
      form,
      applyHelpFeeSelectionContents: getApplyHelpFeeSelectionContents(),
      applyHelpFeeSelectionButtonContents: getButtonsContents(claimId),
    });
}

applyHelpFeeSelectionController.get([HEARING_FEE_APPLY_HELP_FEE_SELECTION], (async (req, res, next: NextFunction) => {
  const form = new GenericForm(new ApplyHelpFeeForm());
  const claimId = req.params.id;
  const redirectUrl = constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL);
  await renderView(res, claimId, form, redirectUrl);
}) as RequestHandler);

applyHelpFeeSelectionController.post(HEARING_FEE_APPLY_HELP_FEE_SELECTION, (async (req:any, res) => {
  const claimId = req.params.id;
  const form = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.VALID_YES_NO_OPTION_TRIAL_ARR'));
  form.validateSync();
  await form.validate();
  if (form.hasErrors()) {
    const redirectUrl = constructResponseUrlWithIdParams(claimId, HEARING_FEE_CANCEL_JOURNEY);
    await renderView(res, claimId, form, redirectUrl);
  } else if(form.model.option === YesNo.NO) {
    res.redirect(constructResponseUrlWithIdParams(claimId, HEARING_FEE_PAYMENT_CREATION));  // TODO: set URL of payment creation
  } else {
    const redisClaimId = generateRedisKey(<AppRequest>req);
    const claim: any = await getCaseDataFromStore(redisClaimId);
    claim.feeTypeHelpRequested = FeeType.HEARING;
    await saveDraftClaim(redisClaimId, claim);
    res.redirect(constructResponseUrlWithIdParams(claimId, APPLY_HELP_WITH_FEES_START));
  }
})as RequestHandler);

export default applyHelpFeeSelectionController;

