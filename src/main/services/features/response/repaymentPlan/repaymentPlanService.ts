import {getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {RepaymentPlanForm} from 'common/form/models/repaymentPlan/repaymentPlanForm';
import {Claim} from 'common/models/claim';
import {RepaymentPlan} from 'common/models/repaymentPlan';
import {getTotalAmountWithInterest} from 'modules/claimDetailsService';
import {AppRequest} from 'models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {PartialAdmission} from 'models/partialAdmission';
import {FullAdmission} from 'models/fullAdmission';
import {PaymentIntention} from 'form/models/admission/paymentIntention';

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

const getRepaymentPlanForm = async (claim: Claim, isPartialAdmission?: boolean) => {
  try {

    const totalClaimAmount = isPartialAdmission ? claim.partialAdmissionPaymentAmount() : await getTotalAmountWithInterest(claim);
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

const saveRepaymentPlanData = async (req: AppRequest, form: RepaymentPlanForm, isPartialAdmission?: boolean) => {
  try {
    const caseId = getRouteParam(req, 'id');
    const draftResult = await getResponseDraft(req, caseId);
    if (!draftResult) {
      throw new Error('[repaymentPlanService] no response draft found');
    }
    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    const draftId = draftResult.rawResponse?.draftId;
    const repaymentPlan: RepaymentPlan = {
      paymentAmount: form.paymentAmount,
      firstRepaymentDate: form.firstRepaymentDate,
      repaymentFrequency: form.repaymentFrequency,
    };

    if (isPartialAdmission) {
      if (!claim.partialAdmission) {
        claim.partialAdmission = new PartialAdmission();
      }
      if (!claim.partialAdmission.paymentIntention) {
        claim.partialAdmission.paymentIntention = new PaymentIntention();
      }
      claim.partialAdmission.paymentIntention.repaymentPlan = repaymentPlan;
    } else {
      if (!claim.fullAdmission) {
        claim.fullAdmission = new FullAdmission();
      }
      if (!claim.fullAdmission.paymentIntention) {
        claim.fullAdmission.paymentIntention = new PaymentIntention();
      }
      claim.fullAdmission.paymentIntention.repaymentPlan = repaymentPlan;
    }
    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }
    await updateResponseDraft(req, caseId, claim, draftId);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getRepaymentPlanForm,
  saveRepaymentPlanData,
};
