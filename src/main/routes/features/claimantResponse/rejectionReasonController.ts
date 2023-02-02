import {NextFunction, Router} from 'express';
import {CLAIMANT_RESPONSE_REJECTION_REASON_URL, CLAIMANT_RESPONSE_TASK_LIST_URL} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {RejectionReason} from '../../../common/form/models/claimantResponse/rejectionReason';
import {
  getClaimantResponse,
  saveClaimantResponse,
} from '../../../../main/services/features/claimantResponse/claimantResponseService';
import {CourtProposedPlanOptions} from 'common/form/models/claimantResponse/courtProposedPlan';

const claimantRejectionReasonPath = 'features/claimantResponse/rejection-reason';
const rejectionReasonController = Router();

rejectionReasonController.get(CLAIMANT_RESPONSE_REJECTION_REASON_URL, async (req, res, next: NextFunction) => {
  try {
    const claimantResponse = await getClaimantResponse(req.params.id);
    const courtProposedPlanDecision = claimantResponse.courtProposedPlan?.decision === CourtProposedPlanOptions.JUDGE_REPAYMENT_PLAN ? CourtProposedPlanOptions.JUDGE_REPAYMENT_PLAN : '';
    const rejectionReason = claimantResponse ?
      claimantResponse.rejectionReason : new RejectionReason();
    res.render(claimantRejectionReasonPath, {form: new GenericForm(rejectionReason), courtProposedPlanDecision: courtProposedPlanDecision});
  } catch (error) {
    next(error);
  }
});

rejectionReasonController.post(CLAIMANT_RESPONSE_REJECTION_REASON_URL, async (req, res, next: NextFunction) => {
  const reason: RejectionReason = new RejectionReason(req.body.text);
  const form: GenericForm<RejectionReason> = new GenericForm(reason);
  await form.validate();
  if (form.hasErrors()) {
    const claimantResponse = await getClaimantResponse(req.params.id);
    const courtProposedPlanDecision = claimantResponse.courtProposedPlan?.decision === CourtProposedPlanOptions.JUDGE_REPAYMENT_PLAN ? CourtProposedPlanOptions.JUDGE_REPAYMENT_PLAN : '';
    res.render(claimantRejectionReasonPath, { form, courtProposedPlanDecision: courtProposedPlanDecision });
  } else {
    try {
      await saveClaimantResponse(req.params.id, reason, 'rejectionReason');
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIMANT_RESPONSE_TASK_LIST_URL));
    } catch (error) {
      next(error);
    }
  }
});

export default rejectionReasonController;
