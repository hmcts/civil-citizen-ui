import {SummarySections} from '../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../common/models/claim';
import {buildYourDetailsSection} from '../../claim/checkAnswers/detailsSection/buildYourDetailsSection';
import {buildTheirDetailsSection} from '../../claim/checkAnswers/detailsSection/buildTheirDetailsSection';
import {buildClaimAmountSection} from './financialSection/buildClaimAmountSection';
import {buildClaimSection} from './claimSection/buildClaimSection';
import {StatementOfTruthForm} from '../../../../common/form/models/statementOfTruth/statementOfTruthForm';
import {QualifiedStatementOfTruth} from '../../../../common/form/models/statementOfTruth/qualifiedStatementOfTruth';
import {SignatureType} from '../../../../common/models/signatureType';
import {isFullAmountReject} from '../../../../modules/claimDetailsService';
import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {isCounterpartyIndividual} from '../../../../common/utils/taskList/tasks/taskListHelpers';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('checkAnswersService');
const buildSummarySections = (claim: Claim, claimId: string, lang: string | unknown): SummarySections => {

  return {
    sections: [
      buildYourDetailsSection(claim, claimId, lang),
      buildTheirDetailsSection(claim, claimId, lang),
      buildClaimAmountSection(claim, claimId, lang),
      buildClaimSection(claim, claimId, lang),
    ],
  };
};

export const getSummarySections = (claimId: string, claim: Claim, lang?: string | unknown): SummarySections => {
  return buildSummarySections(claim, claimId, lang);
};
export const getStatementOfTruth = (claim: Claim): StatementOfTruthForm | QualifiedStatementOfTruth => {
  if (claim.claimDetails.statementOfTruth) {
    return resetCheckboxFields(claim.claimDetails.statementOfTruth);
  }

  switch (getSignatureType(claim)) {
    case SignatureType.BASIC:
      return new StatementOfTruthForm(isFullAmountReject(claim));
    case SignatureType.QUALIFIED:
      return new QualifiedStatementOfTruth(isFullAmountReject(claim));
    default:
      return new StatementOfTruthForm(isFullAmountReject(claim));
  }
};
export const resetCheckboxFields = (statementOfTruth: StatementOfTruthForm | QualifiedStatementOfTruth): StatementOfTruthForm | QualifiedStatementOfTruth => {
  statementOfTruth.directionsQuestionnaireSigned = '';
  statementOfTruth.signed = '';
  return statementOfTruth;
};
export const getSignatureType = (claim: Claim): SignatureType => {
  return isCounterpartyIndividual(claim.applicant1) ? SignatureType.BASIC : SignatureType.QUALIFIED;
};
export const saveStatementOfTruth = async (claimId: string, claimantStatementOfTruth: StatementOfTruthForm) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    claim.claimDetails.statementOfTruth = claimantStatementOfTruth;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

