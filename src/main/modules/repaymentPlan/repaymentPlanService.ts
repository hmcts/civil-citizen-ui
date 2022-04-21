import { getCaseDataFromStore, saveDraftClaim } from '../draft-store/draftStoreService';
import {RepaymentPlanForm} from '../../../main/common/form/models/repaymentPlan/repaymentPlanForm';
import {Claim} from '../../../main/common/models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('selfEmployedAsService');

const getRepaymentPlanForm = async (claimId: string) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    const totalClaimAmount = claim.totalClaimAmount;
    const repaymentPlanForm = new RepaymentPlanForm(totalClaimAmount);
    if (claim.repaymentPlan) {
      const repaymentPlan = claim.repaymentPlan;
      const dateOfBirth =  new Date(repaymentPlan.firstRepaymentDate);
      repaymentPlanForm.day = dateOfBirth.getDate();
      repaymentPlanForm.month = (dateOfBirth.getMonth() + 1);
      repaymentPlanForm.year = dateOfBirth.getFullYear();
      return new RepaymentPlanForm(
        totalClaimAmount,
        repaymentPlan.paymentAmount,
        repaymentPlan.repaymentFrequency,
        repaymentPlanForm.year.toString(),
        repaymentPlanForm.month.toString(),
        repaymentPlanForm.day.toString());
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
      repaymentFrequency: form.repaymentFrequency,
      firstRepaymentDate: form.firstRepaymentDate,
    };
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};


const getClaim = async (claimId: string): Promise<Claim> => {
  const claim = await getCaseDataFromStore(claimId) || new Claim();
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
