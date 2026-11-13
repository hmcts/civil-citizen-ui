import {RepaymentPlanForm} from 'common/form/models/repaymentPlan/repaymentPlanForm';
import { AppRequest } from 'common/models/AppRequest';
import {Request} from 'express';
import { generateRedisKey, getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
import { ValidationError } from 'class-validator';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantSuggestedInstalmentsService');

export const getClaimantSuggestedInstalmentsPlan = async (claimId: string): Promise<RepaymentPlanForm> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    const claimantSuggestedInstalments = claim.claimantResponse?.suggestedPaymentIntention?.repaymentPlan;
    const savedDate = claimantSuggestedInstalments?.firstRepaymentDate;
    // Older cached invalid dates can be null after JSON serialization.
    const firstRepaymentDate = savedDate === null || savedDate === undefined ? undefined : new Date(savedDate);
    const hasValidDate = firstRepaymentDate && Number.isFinite(firstRepaymentDate.getTime());
    const claimAmountAccepted : number = claim.hasClaimantAcceptedDefendantAdmittedAmount() ? claim.partialAdmissionPaymentAmount() : claim.totalClaimAmount;
    return new RepaymentPlanForm(
      claimAmountAccepted,
      claimantSuggestedInstalments?.paymentAmount,
      claimantSuggestedInstalments?.repaymentFrequency,
      hasValidDate ? firstRepaymentDate.getFullYear().toString() : undefined,
      hasValidDate ? (firstRepaymentDate.getMonth() + 1).toString() : undefined,
      hasValidDate ? firstRepaymentDate.getDate().toString() : undefined,
    );
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getClaimantSuggestedInstalmentsForm = async (req: Request): Promise<RepaymentPlanForm> => {
  try {
    const claim = await getCaseDataFromStore(generateRedisKey(req as unknown as AppRequest));
    const claimAmountAccepted : number = claim.hasClaimantAcceptedDefendantAdmittedAmount() ? claim.partialAdmissionPaymentAmount() : claim.totalClaimAmount;
    return new RepaymentPlanForm(
      claimAmountAccepted,
      req.body.paymentAmount,
      req.body.repaymentFrequency,
      req.body.year,
      req.body.month,
      req.body.day,
    );
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const updateDayErrorMsg = (errors?: ValidationError[]) => {
  const updateErrorDayMsg = errors.find(e => e.property === 'day' && (e.constraints?.max || e.constraints?.min));
  if (updateErrorDayMsg) {
    updateErrorDayMsg.constraints = { max: 'ERRORS.VALID_DAY_VARIATION1', min: 'ERRORS.VALID_DAY_VARIATION1' };
  }
};
