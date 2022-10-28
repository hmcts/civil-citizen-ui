import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {StatementOfMeans} from '../../../common/models/statementOfMeans';
import {RejectAllOfClaim} from '../../../common/form/models/rejectAllOfClaim';
import {PartialAdmission} from '../../../common/models/partialAdmission';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('defendantTimelineService');

const resetPreviousResponseTypeSettings = async (claimId: string) => {
  try {
    logger.info('Resetting the previous responseType settings.');
    const claim = await getCaseDataFromStore(claimId);
    if (claim.partialAdmission) {
      claim.partialAdmission = new PartialAdmission();
    }

    if (claim.rejectAllOfClaim) {
      claim.rejectAllOfClaim = new RejectAllOfClaim();
    }

    if (claim.statementOfMeans) {
      claim.statementOfMeans = new StatementOfMeans();
    }

    //clear common fields
    claim.paymentOption = undefined;
    claim.paymentDate = undefined;
    claim.repaymentPlan = undefined;
    claim.evidence = undefined;

    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
export {
  resetPreviousResponseTypeSettings,
};
