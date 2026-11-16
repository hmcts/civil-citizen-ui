import {SummarySections} from 'models/summaryList/summarySections';
import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {buildYourDetailsSection} from './detailsSection/buildYourDetailsSection';
import {buildTheirDetailsSection} from './detailsSection/buildTheirDetailsSection';
import {buildClaimAmountSection} from './financialSection/buildClaimAmountSection';
import {buildClaimSection} from './claimSection/buildClaimSection';
import {StatementOfTruthForm} from 'form/models/statementOfTruth/statementOfTruthForm';
import {QualifiedStatementOfTruth} from 'form/models/statementOfTruth/qualifiedStatementOfTruth';
import {SignatureType} from 'models/signatureType';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {isCounterpartyIndividual} from 'common/utils/taskList/tasks/taskListHelpers';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {QualifiedStatementOfTruthClaimIssue} from 'form/models/statementOfTruth/qualifiedStatementOfTruthClaimIssue';
import {StatementOfTruthFormClaimIssue} from 'form/models/statementOfTruth/statementOfTruthFormClaimIssue';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('checkAnswersService');
const buildSummarySections = (claim: Claim, claimId: string, lang: string, isCarmEnabled = false): SummarySections => {

  return {
    sections: [
      buildYourDetailsSection(claim, claimId, lang, isCarmEnabled),
      buildTheirDetailsSection(claim, claimId, lang),
      buildClaimAmountSection(claim, lang),
      buildClaimSection(claim, claimId, lang),
    ],
  };
};

export const getSummarySections = (claimId: string, claim: Claim, lang?: string, isCarmEnabled = false ): SummarySections => {
  return buildSummarySections(claim, claimId, lang, isCarmEnabled);
};
export const getStatementOfTruth = (claim: Claim): StatementOfTruthForm | QualifiedStatementOfTruth => {
  if (getSignatureType(claim) === SignatureType.QUALIFIED) {
    return new QualifiedStatementOfTruthClaimIssue(false, claim.claimDetails?.statementOfTruth?.signed, claim.claimDetails?.statementOfTruth?.directionsQuestionnaireSigned, claim.claimDetails?.statementOfTruth?.signerName, claim.claimDetails?.statementOfTruth?.signerRole, claim.claimDetails?.statementOfTruth?.acceptNoChangesAllowed);
  }
  return new StatementOfTruthFormClaimIssue(false, SignatureType.BASIC, claim.claimDetails?.statementOfTruth?.signed, claim.claimDetails?.statementOfTruth?.directionsQuestionnaireSigned, claim.claimDetails?.statementOfTruth?.acceptNoChangesAllowed);
};

export const getSignatureType = (claim: Claim): SignatureType => {
  return isCounterpartyIndividual(claim.applicant1) ? SignatureType.BASIC : SignatureType.QUALIFIED;
};
export const saveStatementOfTruth = async (req: AppRequest, claimantStatementOfTruth: StatementOfTruthForm) => {
  try {
    const draftResult = await getDraftClaim(req);
    if (!draftResult) {
      throw new Error('[checkAnswersService] no draft claim found');
    }
    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    const draftId = req.session?.draftId || draftResult.rawResponse?.draftId;
    if (!claim.claimDetails) {
      claim.claimDetails = new ClaimDetails();
    }
    claim.claimDetails.statementOfTruth = claimantStatementOfTruth;
    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }
    await updateDraftClaim(req, claim, draftId);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

