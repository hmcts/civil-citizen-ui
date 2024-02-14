import {NextFunction, Request, Response, Router} from 'express';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'common/form/models/genericForm';
import { generateRedisKey, getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {getLng} from 'common/utils/languageToggleUtils';
import {
  CourtProposedPlan,
  CourtProposedPlanOptions,
} from 'common/form/models/claimantResponse/courtProposedPlan';
import {
  CLAIMANT_RESPONSE_COURT_OFFERED_INSTALMENTS_URL,
  CLAIMANT_RESPONSE_REJECTION_REASON_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
} from '../../urls';
import {
  getClaimantResponse,
  saveClaimantResponse,
} from 'services/features/claimantResponse/claimantResponseService';
import {
  getFinalPaymentDate,
  getFirstRepaymentDate,
  convertFrequencyToText,
  getNumberOfInstalments,
  getPaymentAmount,
  getRepaymentFrequency,
} from 'common/utils/repaymentUtils';
import { AppRequest } from 'common/models/AppRequest';

const courtProposedPlanViewPath = 'features/claimantResponse/court-proposed-plan';
const courtProposedPlanController = Router();
const crPropertyName = 'decision';
const crParentName = 'courtProposedPlan';
let repaymentPlan= {};

function renderView(form: GenericForm<CourtProposedPlan>, repaymentPlan: object, res: Response): void {
  res.render(courtProposedPlanViewPath, { form, repaymentPlan });
}

courtProposedPlanController.get(CLAIMANT_RESPONSE_COURT_OFFERED_INSTALMENTS_URL, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const redisKey = generateRedisKey(req as unknown as AppRequest);
    const claimantResponse = await getClaimantResponse(redisKey);
    const claim: Claim = await getCaseDataFromStore(redisKey);

    repaymentPlan = {
      paymentAmount: getPaymentAmount(claim),
      repaymentFrequency: convertFrequencyToText(getRepaymentFrequency(claim), getLng(lng)),
      firstRepaymentDate: formatDateToFullDate(new Date(getFirstRepaymentDate(claim)), lng),
      finalRepaymentDate: formatDateToFullDate(new Date(getFinalPaymentDate(claim)), lng),
      repaymentLength: getNumberOfInstalments(claim),
    };

    renderView(new GenericForm(new CourtProposedPlan(claimantResponse.courtProposedPlan?.decision)), repaymentPlan, res);
  } catch (error) {
    next(error);
  }
});

courtProposedPlanController.post(CLAIMANT_RESPONSE_COURT_OFFERED_INSTALMENTS_URL, async (req: Request, res: Response, next) => {
  try {
    const claimId = req.params.id;
    const courtProposedPlan = new GenericForm(new CourtProposedPlan(req.body.decision));
    courtProposedPlan.validateSync();
    if (courtProposedPlan.hasErrors()) {
      renderView(courtProposedPlan, repaymentPlan, res);
    } else {
      await saveClaimantResponse(generateRedisKey(req as unknown as AppRequest), courtProposedPlan.model.decision, crPropertyName, crParentName);
      if (courtProposedPlan.model.decision === CourtProposedPlanOptions.ACCEPT_REPAYMENT_PLAN) {
        res.redirect(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_TASK_LIST_URL));
      } else {
        res.redirect(constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_REJECTION_REASON_URL));
      }
    }
  } catch (error) {
    next(error);
  }
});

export default courtProposedPlanController;
