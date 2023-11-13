import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';
import {PartialAdmission} from 'common/models/partialAdmission';
import {RejectAllOfClaim} from 'common/form/models/rejectAllOfClaim';
import {StatementOfMeans} from 'common/models/statementOfMeans';
import {Party} from 'common/models/party';
import {FullAdmission} from 'common/models/fullAdmission';
import {PaymentIntention} from 'common/form/models/admission/paymentIntention';

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
    claim.rejectAllOfClaim = new RejectAllOfClaim();
    claim.partialAdmission = new PartialAdmission();
    claim.partialAdmission.paymentIntention = new PaymentIntention();
    claim.partialAdmission.paymentIntention.paymentOption = undefined;
    claim.partialAdmission.paymentIntention.paymentDate = undefined;
    claim.partialAdmission.paymentIntention.repaymentPlan = undefined;
    claim.evidence = undefined;
    delete claim.mediation;
    delete claim.directionQuestionnaire;
  } else if (claim?.isPartialAdmission()) {
    claim.rejectAllOfClaim = new RejectAllOfClaim();
    claim.fullAdmission = new FullAdmission();
    claim.fullAdmission.paymentIntention = new PaymentIntention();
    claim.fullAdmission.paymentIntention.paymentOption = undefined;
    claim.fullAdmission.paymentIntention.paymentDate = undefined;
    claim.fullAdmission.paymentIntention.repaymentPlan = undefined;
  } else {
    claim.partialAdmission = new PartialAdmission();
    claim.fullAdmission = new FullAdmission();
    claim.statementOfMeans = new StatementOfMeans();
  }
};
