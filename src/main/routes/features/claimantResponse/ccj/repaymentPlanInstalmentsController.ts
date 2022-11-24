import {NextFunction, Request, Response, Router} from 'express';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {
  CCJ_CHECK_AND_SEND_URL,
  CCJ_REPAYMENT_PLAN_INSTALMENTS_URL,
} from '../../../../routes/urls';
import {AppRequest} from '../../../../common/models/AppRequest';
import {ClaimantResponse} from '../../../../common/models/claimantResponse';
import {InstalmentFirstPaymentDate} from '../../../../common/models/claimantResponse/ccj/instalmentFirstPaymentDate';
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
    const totalClaimAmount = claim.totalClaimAmount;
    const form = new GenericForm(new RepaymentPlanInstalments(
      req.body.amount,
      new InstalmentFirstPaymentDate(req.body.firstPaymentDate),
      req.body.paymentFrequency,
      totalClaimAmount,
    ));
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, totalClaimAmount, res);
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
