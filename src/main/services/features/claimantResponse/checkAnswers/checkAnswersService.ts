import { SummarySections } from 'common/models/summaryList/summarySections';
import {Claim} from 'common/models/claim';
import {StatementOfTruthForm} from 'common/form/models/statementOfTruth/statementOfTruthForm';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import { ClaimantResponse } from 'common/models/claimantResponse';
import {getLng} from 'common/utils/languageToggleUtils';
import { buildYourResponseSection } from 'services/features/claimantResponse/responseSection/buildYourResponseSection';
import { buildSettlementAgreementSection, buildJudgmentRequestSection } from '../responseSection/buildSettlementAgreementSection';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantResponseCheckAnswersService');

const buildSummarySections = (claim: Claim, claimId: string, lang: string, claimFee?: number): SummarySections => {
  const getYourResponseSection = () => {
    return claim.isFullDefence() || claim.isPartialAdmission() || claim.isFullAdmission()
      ? buildYourResponseSection(claim, claimId, lang)
      : null;
  };
  const getJudgmentRequestSection = () => {
    return claim.isRequestACCJ()
      ? buildJudgmentRequestSection(claim, claimId, lang, claimFee)
      : null;
  };
  return {
    sections: [
      getYourResponseSection(),
      getJudgmentRequestSection(),
      buildSettlementAgreementSection(claim, claimId, lang),
    ],
  };
};

export const getSummarySections = (claimId: string, claim: Claim, lang?: string | unknown, claimFee?: number): SummarySections => {
  const lng = getLng(lang);
  return buildSummarySections(claim, claimId, lng, claimFee);
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