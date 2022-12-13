import {SummarySections} from '../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../common/models/claim';
import {buildYourDetailsSection} from './detailsSection/buildYourDetailsSection';
import {buildTheirDetailsSection} from './detailsSection/buildTheirDetailsSection';
import {buildClaimAmountSection} from './financialSection/buildClaimAmountSection';
import {buildClaimSection} from './claimSection/buildClaimSection';
import {StatementOfTruthForm} from '../../../../common/form/models/statementOfTruth/statementOfTruthForm';
import {QualifiedStatementOfTruth} from '../../../../common/form/models/statementOfTruth/qualifiedStatementOfTruth';
import {SignatureType} from '../../../../common/models/signatureType';
import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {isCounterpartyIndividual} from '../../../../common/utils/taskList/tasks/taskListHelpers';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';

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
  switch (getSignatureType(claim)) {
    case SignatureType.BASIC:
      return new StatementOfTruthForm(false, SignatureType.BASIC, claim.claimDetails?.statementOfTruth?.signed, claim.claimDetails?.statementOfTruth?.directionsQuestionnaireSigned);
    case SignatureType.QUALIFIED:
      return new QualifiedStatementOfTruth(false, claim.claimDetails?.statementOfTruth?.signed, claim.claimDetails?.statementOfTruth?.directionsQuestionnaireSigned, claim.claimDetails?.statementOfTruth?.signerName, claim.claimDetails?.statementOfTruth?.signerRole);
    default:
      return new StatementOfTruthForm(false, SignatureType.BASIC, claim.claimDetails?.statementOfTruth?.signed, claim.claimDetails?.statementOfTruth?.directionsQuestionnaireSigned);
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

