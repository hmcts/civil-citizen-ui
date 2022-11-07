import {NextFunction, Router} from 'express';
import {CLAIMANT_RESPONSE_REJECTION_REASON_URL, CLAIMANT_RESPONSE_TASK_LIST_URL} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {getRejectionReason, saveRejectionReason} from 'main/services/features/claimantResponse/rejectionReasonService';
import {RejectionReason} from '../../../common/form/models/claimantResponse/rejectionReason';

const claimantRejectionReasonPath = 'features/claimantResponse/rejection-reason';
const rejectionReasonController = Router();

rejectionReasonController.get(CLAIMANT_RESPONSE_REJECTION_REASON_URL, async (req, res, next: NextFunction) => {
  try {
    res.render(claimantRejectionReasonPath, {form: new GenericForm(await getRejectionReason(req.params.id))});
  } catch (error) {
    next(error);
  }
});

rejectionReasonController.post(CLAIMANT_RESPONSE_REJECTION_REASON_URL, async (req, res, next: NextFunction) => {
  const reason: RejectionReason = new RejectionReason(req.body.text);
  const form: GenericForm<RejectionReason> = new GenericForm(reason);
  await form.validate();
  if (form.hasErrors()) {
    res.render(claimantRejectionReasonPath, {form});
  } else {
    try {
      await saveRejectionReason(req.params.id, reason);
      res.redirect(constructResponseUrlWithIdParams(req.params.id, CLAIMANT_RESPONSE_TASK_LIST_URL));
    } catch (error) {
      next(error);
    }
  }
});

export default rejectionReasonController;
