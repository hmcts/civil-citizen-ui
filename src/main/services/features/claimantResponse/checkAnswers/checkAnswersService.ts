import { SummarySections} from 'common/models/summaryList/summarySections';
import {Claim} from 'common/models/claim';
import {StatementOfTruthForm} from 'common/form/models/statementOfTruth/statementOfTruthForm';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {ClaimantResponse} from 'common/models/claimantResponse';
import { getLng } from 'common/utils/languageToggleUtils';
import {buildHowYouWishToProceed,buildYourResponseSection} from 'services/features/claimantResponse/responseSection/buildYourResponseSection';
import {
  buildJudgmentRequestSection,
  buildSettlementAgreementSection,
} from 'services/features/claimantResponse/responseSection/buildSettlementAgreementSection';
import {buildFreeTelephoneMediationSection} from './buildFreeTelephoneMediationSection';
import {buildHearingRequirementsSectionCommon} from 'services/features/common/buildHearingRequirementsSection';
import { buildSummaryForCourtDecisionDetails } from '../responseSection/buildCourtDecisionDetailsSection';
import {isDefendantRejectedMediationOrFastTrackClaim} from 'services/features/response/submitConfirmation/submitConfirmationService';
import {buildMediationSection} from 'services/features/response/checkAnswers/responseSection/buildMediationSection';
import {AppRequest} from 'models/AppRequest';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantResponseCheckAnswersService');

const buildSummarySections = async (claim: Claim, claimId: string, req: AppRequest, lang: string, carmApplicable: boolean, mintiApplicable: boolean, claimFee?: number): Promise<SummarySections> => {
  const getYourResponseSection = () => {
    return claim.isFullDefence() || claim.isPartialAdmission() || claim.isFullAdmission()
      ? buildYourResponseSection(claim, claimId, lang)
      : null;
  };
  const getJudgmentRequestSection = async () => {
    const claimantResponse = Object.assign(new ClaimantResponse(), claim.claimantResponse);
    return claimantResponse.isCCJRequested
      ? await buildJudgmentRequestSection(claim, claimId, lang, claimFee, req)
      : null;
  };
  const getHowYouWishToProceed = () => {
    return buildHowYouWishToProceed(claim, claimId, lang);
  };

  const getMediationSection = () => {
    if (carmApplicable) {
      const mediationSection = buildMediationSection(claim, claimId, lang, true);
      return claim.hasClaimantNotSettled() ? mediationSection : null;
    } else {
      return null;
    }
  };

  const getFreeTelephoneMediationSection = () => {
    if (carmApplicable) {
      return null;
    }
    return (directionQuestionnaireFromClaimant(claim) && !isDefendantRejectedMediationOrFastTrackClaim(claim)
    )
      ? buildFreeTelephoneMediationSection(claim, claimId, lang)
      : null;
  };
  const getHearingRequirementsSection = () => {
    return (directionQuestionnaireFromClaimant(claim)
    )
      ? buildHearingRequirementsSectionCommon(claim, claimId, lang, claim.claimantResponse.directionQuestionnaire, mintiApplicable)
      : null;
  };
  return {
    sections: [
      getYourResponseSection(),
      getHowYouWishToProceed(),
      getMediationSection(),
      await getJudgmentRequestSection(),
      buildSettlementAgreementSection(claim, claimId, lang),
      getFreeTelephoneMediationSection(),
      getHearingRequirementsSection(),
      buildSummaryForCourtDecisionDetails(claim, lang),
    ],
  };
};

export const getSummarySections = async (claimId: string, claim: Claim, req: AppRequest, lang?: string, claimFee?: number, carmApplicable = false, mintiApplicable = false): Promise<SummarySections> => {
  const lng = getLng(lang);
  claim.claimantResponse = Object.assign(new ClaimantResponse(), claim.claimantResponse);
  return await buildSummarySections(claim, claimId, req, lng, carmApplicable, mintiApplicable, claimFee);
};

export const saveStatementOfTruth = async (claimId: string, claimantStatementOfTruth: StatementOfTruthForm) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim.claimantResponse) {
      claim.claimantResponse.claimantStatementOfTruth = claimantStatementOfTruth;
    } else {
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.claimantStatementOfTruth = claimantStatementOfTruth;
    }
    await saveDraftClaim(claimId, claim, true);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

function directionQuestionnaireFromClaimant(claim: Claim) : boolean {
  return (
    claim.hasClaimantRejectedDefendantAdmittedAmount()
    || claim.hasClaimantIntentToProceedResponse()
    || claim.hasClaimantRejectedDefendantPaid()
    || claim.hasClaimantRejectedPartAdmitPayment()
    || claim.hasClaimantRejectedDefendantResponse()
  );
}

export const saveSubmitDate = async (claimId: string, claimantResponse: ClaimantResponse) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (!claim.claimantResponse) {
      claim.claimantResponse = new ClaimantResponse();
    }
    claim.claimantResponse.submittedDate = claimantResponse?.submittedDate;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

