import {SummarySections} from 'common/models/summaryList/summarySections';
import {Claim} from 'common/models/claim';
import {StatementOfTruthForm} from 'common/form/models/statementOfTruth/statementOfTruthForm';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {ClaimantResponse} from 'common/models/claimantResponse';
import { buildHearingRequirementsSection } from './hearingRequirementsSection/buildHearingRequirementsSection';
import { isFullDefenceAndNotCounterClaim } from 'common/utils/taskList/tasks/taskListHelpers';
// import {buildHearingRequirementsSection} from 'services/features/response/checkAnswers/hearingRequirementsSection/buildHearingRequirementsSection';
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantResponseCheckAnswersService');

const buildSummarySections = (claim: Claim, claimId: string, lang: string): SummarySections => {

  const getHearingRequirementsSection = () => {
    return (claim.isPartialAdmission() || isFullDefenceAndNotCounterClaim(claim))
      ? buildHearingRequirementsSection(claim, claimId, lang)
      : null;
  };

  return {
    sections: [
      getHearingRequirementsSection()
    // TODO : This part will be developed as part of other future tasks for different scenarios
    ],
  };
};

export const getSummarySections = (claimId: string, claim: Claim, lang?: string): SummarySections => {
  return buildSummarySections(claim, claimId, lang);
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
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
