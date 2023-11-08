import {NextFunction, RequestHandler, Router} from 'express';
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
import {saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';
import {FeeType} from 'form/models/fee';
import {ApplyHelpFeeForm} from 'models/caseProgression/hearingFee/applyHelpFeeForm';
import {GenericYesNo} from 'form/models/genericYesNo';

const applyHelpFeeSelectionViewPath  = 'features/caseProgression/hearingFee/apply-help-fee-selection';
const applyHelpFeeSelectionController: Router = Router();
const dqPropertyName = 'feeTypeHelpRequested';

applyHelpFeeSelectionController.get([HEARING_FEE_APPLY_HELP_FEE_SELECTION], (async (req, res, next: NextFunction) => {
  const form = new GenericForm(new ApplyHelpFeeForm());
  const claimId = req.params.id;
  const latestUploadUrl = constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL);
  res.render(applyHelpFeeSelectionViewPath, {latestUploadUrl, form, applyHelpFeeSelectionContents:getApplyHelpFeeSelectionContents()});
}) as RequestHandler);

applyHelpFeeSelectionController.post(HEARING_FEE_APPLY_HELP_FEE_SELECTION, (async (req:any, res) => {
  const claimId = req.params.id;
  const form = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.VALID_YES_NO_OPTION_TRIAL_ARR'));
  form.validateSync();
  await form.validate();
  if (form.hasErrors()) {
    const latestUploadUrl = constructResponseUrlWithIdParams(claimId, HEARING_FEE_CANCEL_JOURNEY);
    res.render(applyHelpFeeSelectionViewPath, {latestUploadUrl, form, applyHelpFeeSelectionContents:getApplyHelpFeeSelectionContents()});
  } else if(form.model.option === YesNo.NO) {
    res.redirect(constructResponseUrlWithIdParams(claimId, HEARING_FEE_PAYMENT_CREATION));  // TODO: set URL of payment creation
  } else {
    const feeType : FeeType = FeeType.HEARING;
    await saveCaseProgression(req.params.id, feeType, dqPropertyName);
    res.redirect(constructResponseUrlWithIdParams(claimId, APPLY_HELP_WITH_FEES_START));
  }
})as RequestHandler);

export default applyHelpFeeSelectionController;

