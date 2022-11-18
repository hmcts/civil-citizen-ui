import {NextFunction, Request, Response, Router} from 'express';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {
  CCJ_CHECK_AND_SEND_URL,
  CCJ_REPAYMENT_PLAN_INSTALMENTS_URL,
} from '../../../../routes/urls';
import {AppRequest} from '../../../../common/models/AppRequest';
import {ClaimantResponse} from '../../../../common/models/claimantResponse';
import {RepaymentPlanInstalments} from '../../../../common/models/claimantResponse/ccj/repaymentPlanInstalments';
import {InstalmentFirstPaymentDate} from '../../../../common/models/claimantResponse/ccj/instalmentFirstPaymentDate';
import {constructResponseUrlWithIdParams} from '../../../../common/utils/urlFormatter';
import {toNumberOrUndefined} from '../../../../common/utils/numberConverter';
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
      toNumberOrUndefined(req.body.amount),
      new InstalmentFirstPaymentDate(req.body.day, req.body.month, req.body.year),
      req.body.paymentFrequency,
    ));
    form.validateSync();

    console.log('Controller Errors:', JSON.stringify(form.errors));
    if (form.hasErrors()) {
      renderView(form, claim.totalClaimAmount, res);
    } else {
      await saveClaimantResponse(claimId, form.model, 'repaymentPlanInstalments', 'ccjRequest');
      res.redirect(constructResponseUrlWithIdParams(claimId, CCJ_CHECK_AND_SEND_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default repaymentPlanInstalmentsController;
