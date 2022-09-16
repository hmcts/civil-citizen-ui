import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {GenericYesNo} from '../../../common/form/models/genericYesNo';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('DQ - Defendant expert evidence');
const expertEvidenceErrorMessage = 'ERRORS.DEFENDANT_EXPERT_EVIDENCE_REQUIRED';

const getExpertEvidence = async (claimId: string): Promise<GenericYesNo> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    return caseData?.directionQuestionnaire?.defendantExpertEvidence ? caseData.directionQuestionnaire.defendantExpertEvidence : new GenericYesNo(undefined, expertEvidenceErrorMessage);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
const getExpertEvidenceForm = (expertEvidence: string): GenericYesNo => {
  return new GenericYesNo(expertEvidence, expertEvidenceErrorMessage);
};

export {
  getExpertEvidence,
  getExpertEvidenceForm,
};
