import {SummarySections} from 'models/summaryList/summarySections';
import {Claim} from 'models/claim';
import {buildYourDetailsSection} from './detailsSection/buildYourDetailsSection';
import {buildTheirDetailsSection} from './detailsSection/buildTheirDetailsSection';
import {buildClaimAmountSection} from './financialSection/buildClaimAmountSection';
import {buildClaimSection} from './claimSection/buildClaimSection';
import {StatementOfTruthForm} from 'form/models/statementOfTruth/statementOfTruthForm';
import {QualifiedStatementOfTruth} from 'form/models/statementOfTruth/qualifiedStatementOfTruth';
import {SignatureType} from 'models/signatureType';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {isCounterpartyIndividual} from 'common/utils/taskList/tasks/taskListHelpers';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {QualifiedStatementOfTruthClaimIssue} from 'form/models/statementOfTruth/qualifiedStatementOfTruthClaimIssue';
import {StatementOfTruthFormClaimIssue} from 'form/models/statementOfTruth/statementOfTruthFormClaimIssue';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('checkAnswersService');
const buildSummarySections = (claim: Claim, claimId: string, lang: string | unknown): SummarySections => {

  return {
    sections: [
      buildYourDetailsSection(claim, claimId, lang),
      buildTheirDetailsSection(claim, claimId, lang),
      buildClaimAmountSection(claim, lang),
      buildClaimSection(claim, claimId, lang),
    ],
  };
};

export const getSummarySections = (claimId: string, claim: Claim, lang?: string | unknown): SummarySections => {
  return buildSummarySections(claim, claimId, lang);
};
export const getStatementOfTruth = (claim: Claim): StatementOfTruthForm | QualifiedStatementOfTruth => {
  switch (getSignatureType(claim)) {
    case SignatureType.BASIC:
      return new StatementOfTruthFormClaimIssue(false, SignatureType.BASIC, claim.claimDetails?.statementOfTruth?.signed, claim.claimDetails?.statementOfTruth?.directionsQuestionnaireSigned, claim.claimDetails?.statementOfTruth?.acceptNoChangesAllowed);
    case SignatureType.QUALIFIED:
      return new QualifiedStatementOfTruthClaimIssue(false, claim.claimDetails?.statementOfTruth?.signed, claim.claimDetails?.statementOfTruth?.directionsQuestionnaireSigned, claim.claimDetails?.statementOfTruth?.signerName, claim.claimDetails?.statementOfTruth?.signerRole, claim.claimDetails?.statementOfTruth?.acceptNoChangesAllowed);
    default:
      return new StatementOfTruthFormClaimIssue(false, SignatureType.BASIC, claim.claimDetails?.statementOfTruth?.signed, claim.claimDetails?.statementOfTruth?.directionsQuestionnaireSigned, claim.claimDetails?.statementOfTruth?.acceptNoChangesAllowed);
  }
};

export const getSignatureType = (claim: Claim): SignatureType => {
  return isCounterpartyIndividual(claim.applicant1) ? SignatureType.BASIC : SignatureType.QUALIFIED;
};
export const saveStatementOfTruth = async (claimId: string, claimantStatementOfTruth: StatementOfTruthForm) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (!claim.claimDetails) {
      claim.claimDetails = new ClaimDetails();
    }
    claim.claimDetails.statementOfTruth = claimantStatementOfTruth;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

