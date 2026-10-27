import {getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {Claim} from 'common/models/claim';
import {PartialAdmission} from 'common/models/partialAdmission';
import {RejectAllOfClaim} from 'common/form/models/rejectAllOfClaim';
import {StatementOfMeans} from 'common/models/statementOfMeans';
import {Party} from 'common/models/party';
import {FullAdmission} from 'common/models/fullAdmission';
import {PaymentIntention} from 'common/form/models/admission/paymentIntention';
import {AppRequest} from 'models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('citizenResponseTypeService');

export const saveResponseType = async (req: AppRequest, citizenResponseType: string) => {
  try {
    const caseId = getRouteParam(req, 'id');
    const draftResult = await getResponseDraft(req, caseId);
    if (!draftResult) {
      throw new Error('[citizenResponseTypeService] no draft response found');
    }
    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    const draftId = draftResult.rawResponse?.draftId;

    if (claim.respondent1) {
      claim.respondent1.responseType = citizenResponseType;
    } else {
      const respondent = new Party();
      respondent.responseType = citizenResponseType;
      claim.respondent1 = respondent;
    }
    resetPreviousResponseTypeSetting(claim);

    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }
    await updateResponseDraft(req, caseId, claim, draftId);
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
