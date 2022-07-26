import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {RepaymentPlanForm} from '../../../../common/form/models/repaymentPlan/repaymentPlanForm';
import {Claim} from '../../../../common/models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('selfEmployedAsService');

const getRepaymentPlanForm = (claim: Claim) => {
  try {
    const totalClaimAmount = claim.totalClaimAmount;
    if (claim.repaymentPlan) {
      const repaymentPlan = claim.repaymentPlan;
      const firstRepaymentDate = new Date(repaymentPlan.firstRepaymentDate);
      return new RepaymentPlanForm(
        totalClaimAmount,
        repaymentPlan.paymentAmount,
        repaymentPlan.repaymentFrequency,
        firstRepaymentDate.getFullYear().toString(),
        (firstRepaymentDate.getMonth() + 1).toString(),
        firstRepaymentDate.getDate().toString(),
      );
    }
    return new RepaymentPlanForm(totalClaimAmount);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveRepaymentPlanData = async (claimId: string, form: RepaymentPlanForm) => {
  try {
    const claim = await getClaim(claimId);
    claim.repaymentPlan = {
      paymentAmount: form.paymentAmount,
      firstRepaymentDate: form.firstRepaymentDate,
      repaymentFrequency: form.repaymentFrequency,
    };
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};


const getClaim = async (claimId: string): Promise<Claim> => {
  const claim = await getCaseDataFromStore(claimId);
  if (!claim.repaymentPlan) {
    claim.repaymentPlan = {
      paymentAmount: 0,
      repaymentFrequency: '',
      firstRepaymentDate: null,
    };
  }
  return claim;
};


export {
  getRepaymentPlanForm,
  saveRepaymentPlanData,
};
