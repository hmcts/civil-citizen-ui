import {SummarySections} from 'models/summaryList/summarySections';
import {Claim} from 'models/claim';
import {buildPaymentDetailsSection} from 'services/features/claim/checkAnswers/financialSection/buildPaymentSection';
import {buildTheirDetailsSection}
  from 'services/features/claim/checkAnswers/detailsSection/buildCcjTheirDetailsSection';
import { SignatureType } from 'common/models/signatureType';
import {QualifiedStatementOfTruth} from 'form/models/statementOfTruth/qualifiedStatementOfTruth';
import {StatementOfTruthForm} from 'form/models/statementOfTruth/statementOfTruthForm';
import {isCounterpartyIndividual} from 'common/utils/taskList/tasks/taskListHelpers';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {ClaimantResponse} from 'models/claimantResponse';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('ccjCheckAnswersService');

const buildSummarySections = async (claim: Claim, claimId: string, lang: string): Promise<SummarySections> => {

  return {
    sections: [
      buildTheirDetailsSection(claim, claimId, lang),
      await buildPaymentDetailsSection(claim, claimId, lang),
    ],
  };
};

export const getSummarySections = async (claimId: string, claim: Claim, lang: string): Promise<SummarySections> => {
  return await buildSummarySections(claim, claimId, lang);
};

export const getStatementOfTruth = (claim: Claim): StatementOfTruthForm | QualifiedStatementOfTruth => {
  switch (getSignatureType(claim)) {
    case SignatureType.BASIC:
      return new StatementOfTruthForm(false, SignatureType.BASIC, claim.claimantResponse?.ccjRequest?.statementOfTruth?.signed, claim.claimantResponse?.ccjRequest?.statementOfTruth?.directionsQuestionnaireSigned);
    case SignatureType.QUALIFIED:
      return new QualifiedStatementOfTruth(false, claim.claimantResponse?.ccjRequest?.statementOfTruth?.signed, claim.claimantResponse?.ccjRequest?.statementOfTruth?.directionsQuestionnaireSigned, claim.claimantResponse?.ccjRequest?.statementOfTruth?.signerName, claim.claimantResponse?.ccjRequest?.statementOfTruth?.signerRole);
    default:
      return new StatementOfTruthForm(false, SignatureType.BASIC, claim.claimantResponse?.ccjRequest?.statementOfTruth?.signed, claim.claimantResponse?.ccjRequest?.statementOfTruth?.directionsQuestionnaireSigned);
  }
};

export const getSignatureType = (claim: Claim): SignatureType => {
  return isCounterpartyIndividual(claim.applicant1) ? SignatureType.BASIC : SignatureType.QUALIFIED;
};

export const saveStatementOfTruth = async (redisKey: string, claimantStatementOfTruth: StatementOfTruthForm) => {
  try {
    const claim = await getCaseDataFromStore(redisKey);
    if (!claim.claimantResponse) {
      claim.claimantResponse = new ClaimantResponse();
    }
    claim.claimantResponse.ccjRequest.statementOfTruth = claimantStatementOfTruth;
    await saveDraftClaim(redisKey, claim, true);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
