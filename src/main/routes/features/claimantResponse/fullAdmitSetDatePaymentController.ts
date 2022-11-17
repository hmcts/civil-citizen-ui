import {NextFunction, Request, Response, Router} from 'express';
import {
  CLAIMANT_RESPONSE_FULL_ADMIT_SET_DATE_PAYMENT_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
} from '../../../routes/urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {AppRequest} from '../../../common/models/AppRequest';
import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {saveClaimantResponse} from '../../../services/features/claimantResponse/claimantResponseService';
import {getFullAdmitSetDatePaymentDetails} from '../../../services/features/claimantResponse/fullAdmitSetDatePaymentService';

const fullAdmitSetDatePaymentController = Router();
const fullAdmitSetDatePaymentPath = 'features/claimantResponse/full-admit-set-date-payment';

function renderView(form: GenericForm<GenericYesNo>, defendantName: string, proposedSetDate: string, res: Response): void {
  res.render(fullAdmitSetDatePaymentPath, {
    form,
    defendantName,
    proposedSetDate,
  });
}

fullAdmitSetDatePaymentController.get(CLAIMANT_RESPONSE_FULL_ADMIT_SET_DATE_PAYMENT_URL, async (req:AppRequest, res:Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const details = await getFullAdmitSetDatePaymentDetails(claimId);
    await renderView(new GenericForm(details.fullAdmitAcceptPayment), details.defendantName, details.proposedSetDate, res);
  } catch (error) {
    next(error);
  }
});

fullAdmitSetDatePaymentController.post(CLAIMANT_RESPONSE_FULL_ADMIT_SET_DATE_PAYMENT_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const propertyName = 'fullAdmitSetDateAcceptPayment';
    const form: GenericForm<GenericYesNo> = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.VALID_YES_NO_SELECTION'));
    form.validateSync();

    if (form.hasErrors()) {
      const details = await getFullAdmitSetDatePaymentDetails(claimId);
      await renderView(form, details.defendantName, details.proposedSetDate, res);
    } else {
      await saveClaimantResponse(claimId, form.model, propertyName);
      res.redirect(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default fullAdmitSetDatePaymentController;
