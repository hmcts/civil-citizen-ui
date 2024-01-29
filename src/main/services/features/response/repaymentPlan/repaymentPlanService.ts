import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {RepaymentPlanForm} from 'common/form/models/repaymentPlan/repaymentPlanForm';
import {Claim} from 'common/models/claim';
import {RepaymentPlan} from 'common/models/repaymentPlan';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('selfEmployedAsService');

const getForm = (totalClaimAmount: number, repaymentPlan: RepaymentPlan, firstRepaymentDate: Date) => {
  return new RepaymentPlanForm(
    totalClaimAmount,
    repaymentPlan.paymentAmount,
    repaymentPlan.repaymentFrequency,
    firstRepaymentDate.getFullYear().toString(),
    (firstRepaymentDate.getMonth() + 1).toString(),
    firstRepaymentDate.getDate().toString(),
  );
};

const getRepaymentPlanForm = (claim: Claim, isPartialAdmission?: boolean) => {
  try {
    const totalClaimAmount = isPartialAdmission ? claim.partialAdmissionPaymentAmount() : claim.totalClaimAmount;

    if (isPartialAdmission && claim.partialAdmission?.paymentIntention?.repaymentPlan) {
      const repaymentPlan = claim.partialAdmission.paymentIntention.repaymentPlan;
      const firstRepaymentDate = new Date(repaymentPlan.firstRepaymentDate);
      return getForm(totalClaimAmount, repaymentPlan, firstRepaymentDate);
    }

    if (claim.fullAdmission?.paymentIntention?.repaymentPlan) {
      const repaymentPlan = claim.fullAdmission.paymentIntention.repaymentPlan;
      const firstRepaymentDate = new Date(repaymentPlan.firstRepaymentDate);
      return getForm(totalClaimAmount, repaymentPlan, firstRepaymentDate);
    }

    return new RepaymentPlanForm(totalClaimAmount);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveRepaymentPlanData = async (claimId: string, form: RepaymentPlanForm, isPartialAdmission?: boolean) => {
  try {
    const claim = await getClaim(claimId, isPartialAdmission);
    const repaymentPlan: RepaymentPlan = {
      paymentAmount: form.paymentAmount,
      firstRepaymentDate: form.firstRepaymentDate,
      repaymentFrequency: form.repaymentFrequency,
    };

    if (isPartialAdmission) {
      claim.partialAdmission.paymentIntention.repaymentPlan = repaymentPlan;
    } else {
      claim.fullAdmission.paymentIntention.repaymentPlan = repaymentPlan;
    }
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const getClaim = async (claimId: string, isPartialAdmission?: boolean): Promise<Claim> => {
  const claim = await getCaseDataFromStore(claimId);
  const repaymentPlan: RepaymentPlan = {
    paymentAmount: 0,
    repaymentFrequency: '',
    firstRepaymentDate: null,
  };
  if (isPartialAdmission) {
    if (!claim.partialAdmission.paymentIntention.repaymentPlan) {
      claim.partialAdmission.paymentIntention.repaymentPlan = repaymentPlan;
    }
  } else if (!claim.fullAdmission.paymentIntention.repaymentPlan) {
    claim.fullAdmission.paymentIntention.repaymentPlan = repaymentPlan;

  }
  return claim;
};

export {
  getRepaymentPlanForm,
  saveRepaymentPlanData,
};
