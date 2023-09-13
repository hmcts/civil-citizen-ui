import {NextFunction, Request, Response, Router} from 'express';
import {
  CLAIMANT_RESPONSE_ACCEPT_REPAYMENT_PLAN_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
} from '../../urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';
import {getFullAdmitSetDatePaymentDetails} from 'services/features/claimantResponse/fullAdmitSetDatePaymentService';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';
import {getLng} from 'common/utils/languageToggleUtils';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {RepaymentPlanSummary} from 'common/form/models/admission/repaymentPlanSummary';
import { 
  getPaymentAmount, 
  getRepaymentFrequency,
  getFirstRepaymentDate,
  getFinalPaymentDate,
  getRepaymentLength,
  convertFrequencyToText,
} from 'common/utils/repaymentUtils';

const acceptRepaymentPlanController = Router();
const fullAdmitSetDatePaymentPath = 'features/claimantResponse/accept-repayment-plan';
let repaymentPlan: RepaymentPlanSummary;

function renderView(form: GenericForm<GenericYesNo>, repaymentPlan: RepaymentPlanSummary, res: Response, displayHintTextForNoOption: boolean): void {
  res.render(fullAdmitSetDatePaymentPath, { form, repaymentPlan, displayHintTextForNoOption });
}

acceptRepaymentPlanController.get(CLAIMANT_RESPONSE_ACCEPT_REPAYMENT_PLAN_URL, async (req:AppRequest, res:Response, next: NextFunction) => {
  try {
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const details = await getFullAdmitSetDatePaymentDetails(claimId);
    const claim: Claim = await getCaseDataFromStore(claimId);
    const frequency = getRepaymentFrequency(claim);
    repaymentPlan = {
      paymentAmount: getPaymentAmount(claim),
      repaymentFrequency: convertFrequencyToText(frequency, getLng(lang)),
      firstRepaymentDate: formatDateToFullDate(getFirstRepaymentDate(claim)),
      finalRepaymentDate: formatDateToFullDate(getFinalPaymentDate(claim)),
      lengthOfRepaymentPlan: getRepaymentLength(claim, getLng(lang)),
    };
    const displayHintTextForNoOption = claim.isBusiness();
    renderView(new GenericForm(details.fullAdmitAcceptPayment), repaymentPlan, res, displayHintTextForNoOption);
  } catch (error) {
    next(error);
  }
});

acceptRepaymentPlanController.post(CLAIMANT_RESPONSE_ACCEPT_REPAYMENT_PLAN_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const propertyName = 'fullAdmitSetDateAcceptPayment';
    const form: GenericForm<GenericYesNo> = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.VALID_YES_NO_SELECTION'));
    const displayHintTextForNoOption = (await getCaseDataFromStore(claimId)).isBusiness();
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, repaymentPlan, res, displayHintTextForNoOption);
    } else {
      await saveClaimantResponse(claimId, form.model, propertyName);
      res.redirect(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL));
    }
  } catch (error) {
    next(error);
  }
});

export default acceptRepaymentPlanController;
