import {NextFunction, Request, Response, Router} from 'express';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {
  CCJ_CHECK_AND_SEND_URL,
  CCJ_REPAYMENT_PLAN_INSTALMENTS_URL,
} from '../../../../routes/urls';
import {PaymentDate} from '../../../../common/form/models/admission/fullAdmission/paymentOption/paymentDate';
import {AppRequest} from '../../../../common/models/AppRequest';
import {ClaimantResponse} from '../../../../common/models/claimantResponse';
import {RepaymentPlanInstalments} from '../../../../common/models/claimantResponse/ccj/repaymentPlanInstalments';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {getCaseDataFromStore} from '../../../../modules/draft-store/draftStoreService';
import {saveClaimantResponse} from '../../../../../main/services/features/claimantResponse/claimantResponseService';

const repaymentPlanInstalmentsController = Router();
const repaymentPlanInstalmentsPath = 'features/claimantResponse/ccj/repayment-plan-instalments';

function renderView(form: GenericForm<RepaymentPlanInstalments>, totalClaimAmount: number, res: Response): void {
  res.render(repaymentPlanInstalmentsPath, {
    form,
    totalClaimAmount: totalClaimAmount,
    exampleDate: new Date(),
  });
}

repaymentPlanInstalmentsController.get(CCJ_REPAYMENT_PLAN_INSTALMENTS_URL, async (req:AppRequest, res:Response, next: NextFunction) => {
  try {
    const claim = await getCaseDataFromStore(req.params.id);
    const claimantResponse = claim.claimantResponse ? claim.claimantResponse : new ClaimantResponse();
    const repaymentPlanInstalments = claimantResponse.ccjRequest
      ? claimantResponse.ccjRequest.repaymentPlanInstalments
      : new RepaymentPlanInstalments();
    renderView(new GenericForm(repaymentPlanInstalments), claim.totalClaimAmount, res);
  } catch (error) {
    next(error);
  }
});

repaymentPlanInstalmentsController.post(CCJ_REPAYMENT_PLAN_INSTALMENTS_URL, async (req:Request, res:Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getCaseDataFromStore(claimId);
    const form = new GenericForm(new RepaymentPlanInstalments(
      req.body.amount,
      new PaymentDate(
        req.body.firstPaymentDate.year,
        req.body.firstPaymentDate.month,
        req.body.firstPaymentDate.day,
      ),
      req.body.paymentFrequency,
    ));
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, claim.totalClaimAmount, res);
    } else {
      const claimantResponsePropertyName = 'repaymentPlanInstalments';
      const parentPropertyName = 'ccjRequest';
      await saveClaimantResponse(claimId, form.model, claimantResponsePropertyName, parentPropertyName);
      res.redirect(constructResponseUrlWithIdParams(claimId, CCJ_CHECK_AND_SEND_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default repaymentPlanInstalmentsController;
