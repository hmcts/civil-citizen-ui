import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {PartialAdmission} from '../../../../../main/common/models/partialAdmission';
import {RejectAllOfClaim} from '../../../../common/form/models/rejectAllOfClaim';
import {StatementOfMeans} from '../../../../../main/common/models/statementOfMeans';
import {Party} from '../../../../../main/common/models/party';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('citizenResponseTypeService');

export const saveResponseType = async (claimId: string, citizenResponseType: string) => {
  try {
    const claim = await getCaseDataFromStore(claimId) || new Claim();
    if (claim.respondent1) {
      claim.respondent1.responseType = citizenResponseType;
    } else {
      const respondent = new Party();
      respondent.responseType = citizenResponseType;
      claim.respondent1 = respondent;
    }
    resetPreviousResponseTypeSetting(claim);
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const resetPreviousResponseTypeSetting = (claim: Claim) => {
  if (claim?.isFullAdmission()) {
    claim.partialAdmission = new PartialAdmission();
    claim.rejectAllOfClaim = new RejectAllOfClaim();
    claim.evidence = undefined;
  } else if (claim?.isPartialAdmission()) {
    claim.rejectAllOfClaim = new RejectAllOfClaim();
    claim.paymentOption = undefined;
    claim.paymentDate = undefined;
  } else {
    claim.partialAdmission = new PartialAdmission();
    claim.statementOfMeans = new StatementOfMeans();
    claim.paymentOption = undefined;
    claim.paymentDate = undefined;
    claim.repaymentPlan = undefined;
  }
};
