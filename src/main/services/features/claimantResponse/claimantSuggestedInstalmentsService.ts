import {RepaymentPlanForm} from 'common/form/models/repaymentPlan/repaymentPlanForm';
import { AppRequest } from 'common/models/AppRequest';
import {Request} from 'express';
import { generateRedisKey, getCaseDataFromStore } from 'modules/draft-store/draftStoreService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantSuggestedInstalmentsService');

export const getClaimantSuggestedInstalmentsPlan = async (claimId: string): Promise<RepaymentPlanForm> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    const claimantSuggestedInstalments = claim.claimantResponse?.suggestedPaymentIntention?.repaymentPlan;
    const firstRepaymentDate = new Date(claimantSuggestedInstalments?.firstRepaymentDate);
    const claimAmount : number = claim.hasClaimantAcceptedDefendantAdmittedAmount() ? claim.partialAdmissionPaymentAmount() : claim.totalClaimAmount;
    return claimantSuggestedInstalments ? new RepaymentPlanForm(
      claimAmount,
      claimantSuggestedInstalments.paymentAmount,
      claimantSuggestedInstalments.repaymentFrequency,
      firstRepaymentDate.getFullYear().toString(),
      (firstRepaymentDate.getMonth() + 1).toString(),
      firstRepaymentDate.getDate().toString(),
    ) : new RepaymentPlanForm(claimAmount);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getClaimantSuggestedInstalmentsForm = async (req: Request): Promise<RepaymentPlanForm> => {
  try {
    const claim = await getCaseDataFromStore(generateRedisKey(req as unknown as AppRequest));
    const claimAmount : number = claim.hasClaimantSettleTheClaimForDefendantPartlyPaidAmount() ? claim.partialAdmissionPaymentAmount() : claim.totalClaimAmount;
    return new RepaymentPlanForm(
      claimAmount,
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
