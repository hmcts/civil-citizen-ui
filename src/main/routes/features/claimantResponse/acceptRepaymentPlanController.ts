import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {CLAIMANT_RESPONSE_ACCEPT_REPAYMENT_PLAN_URL, CLAIMANT_RESPONSE_TASK_LIST_URL} from '../../urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {saveClaimantResponse} from 'services/features/claimantResponse/claimantResponseService';
import {getSetDatePaymentDetails} from 'services/features/claimantResponse/getSetDatePaymentDetails';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';
import {getLng} from 'common/utils/languageToggleUtils';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {RepaymentPlanSummary} from 'common/form/models/admission/repaymentPlanSummary';
import {
  convertFrequencyToText,
  getFinalPaymentDate,
  getFirstRepaymentDate,
  getPaymentAmount,
  getRepaymentFrequency,
  getRepaymentLength,
} from 'common/utils/repaymentUtils';

const acceptRepaymentPlanController = Router();
const fullAdmitSetDatePaymentPath = 'features/claimantResponse/accept-repayment-plan';
let repaymentPlan: RepaymentPlanSummary;

function renderView(form: GenericForm<GenericYesNo>, repaymentPlan: RepaymentPlanSummary, res: Response, displayHintTextForNoOption: boolean, isPayBySetDate: boolean, defendantName: string, proposedSetDate: string): void {
  res.render(fullAdmitSetDatePaymentPath, {
    form,
    repaymentPlan,
    displayHintTextForNoOption,
    isPayBySetDate,
    defendantName,
    proposedSetDate,
  });
}

acceptRepaymentPlanController.get(CLAIMANT_RESPONSE_ACCEPT_REPAYMENT_PLAN_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim: Claim = await getCaseDataFromStore(generateRedisKey(<AppRequest>req));
    const details = await getSetDatePaymentDetails(claim, lang);
    const isPayBySetDate = claim.isDefendantResponsePayBySetDate();
    const frequency = getRepaymentFrequency(claim);
    repaymentPlan = {
      paymentAmount: getPaymentAmount(claim),
      repaymentFrequency: convertFrequencyToText(frequency, getLng(lang)),
      firstRepaymentDate: formatDateToFullDate(getFirstRepaymentDate(claim), getLng(lang)),
      finalRepaymentDate: formatDateToFullDate(getFinalPaymentDate(claim), getLng(lang)),
      lengthOfRepaymentPlan: getRepaymentLength(claim, getLng(lang)),
    };
    const displayHintTextForNoOption = claim.isBusiness();
    renderView(new GenericForm(details.fullAdmitAcceptPayment), repaymentPlan, res, displayHintTextForNoOption, isPayBySetDate, details?.defendantName, details?.proposedSetDate);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

acceptRepaymentPlanController.post(CLAIMANT_RESPONSE_ACCEPT_REPAYMENT_PLAN_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const redisKey = generateRedisKey(<AppRequest>req);
    const propertyName = 'fullAdmitSetDateAcceptPayment';
    const form: GenericForm<GenericYesNo> = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.VALID_YES_NO_SELECTION'));
    const claim: Claim = await getCaseDataFromStore(redisKey);
    const details = await getSetDatePaymentDetails(claim, lang);
    const displayHintTextForNoOption = claim.isBusiness();
    const isPayBySetDate = claim.isDefendantResponsePayBySetDate();
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, repaymentPlan, res, displayHintTextForNoOption, isPayBySetDate, details?.defendantName, details?.proposedSetDate);
    } else {
      await saveClaimantResponse(redisKey, form.model, propertyName);
      res.redirect(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default acceptRepaymentPlanController;
