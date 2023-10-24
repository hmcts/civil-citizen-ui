import { SummarySections} from 'common/models/summaryList/summarySections';
import {Claim} from 'common/models/claim';
import {StatementOfTruthForm} from 'common/form/models/statementOfTruth/statementOfTruthForm';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {ClaimantResponse} from 'common/models/claimantResponse';
import { getLng } from 'common/utils/languageToggleUtils';
import {buildYourResponseSection} from 'services/features/claimantResponse/responseSection/buildYourResponseSection';
import {
  buildSettlementAgreementSection,
} from 'services/features/claimantResponse/responseSection/buildSettlementAgreementSection';
import {buildFreeTelephoneMediationSection} from './buildFreeTelephoneMediationSection';
import {buildHearingRequirementsSectionCommon} from 'services/features/common/buildHearingRequirementsSection';
import {isFullDefenceAndNotCounterClaim} from 'common/utils/taskList/tasks/taskListHelpers';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantResponseCheckAnswersService');

const buildSummarySections = (claimId: string, claim: Claim, lang: string): SummarySections => {
  const getYourResponseSection = () => {
    return claim.isFullDefence() || claim.isPartialAdmission()
      ? buildYourResponseSection(claim, claimId, lang)
      : null;
  };
  const getFreeTelephoneMediationSection = () => {
    return claim.isFullDefence() || claim.isPartialAdmission()
      ? buildFreeTelephoneMediationSection(claim, claimId, lang)
      : null;
  };
  const getHearingRequirementsSection = () => {
    return (claim.isPartialAdmission() || isFullDefenceAndNotCounterClaim(claim))
      ? buildHearingRequirementsSectionCommon(claim, claimId, lang, claim.claimantResponse.directionQuestionnaire)
      : null;
  };
  return {
    sections: [
      getYourResponseSection(),
      buildSettlementAgreementSection(claim, claimId, lang),
      getFreeTelephoneMediationSection(),
      getHearingRequirementsSection(),
    ],
  };
};

export const getSummarySections = (claimId: string, claim: Claim, lang?: string): SummarySections => {
  const lng = getLng(lang);
  return buildSummarySections(claimId, claim, lng);
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
