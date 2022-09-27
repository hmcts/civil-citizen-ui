
import { getCaseDataFromStore, saveDraftClaim } from '../../../../main/modules/draft-store/draftStoreService';
import {OtherWitnessItems} from '../../../../main/common/models/directionsQuestionnaire/otherWitnesses/otherWitnessItems';
import {OtherWitnesses} from '../../../../main/common/models/directionsQuestionnaire/otherWitnesses/otherWitnesses';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('expertReportDetailsService');

const getOtherWitnesses = async (claimId: string) => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    if (caseData.directionQuestionnaire?.otherWitnesses) {
      const otherWitnesses = caseData.directionQuestionnaire.otherWitnesses;
      caseData.directionQuestionnaire.otherWitnesses.witnessItems = caseData.directionQuestionnaire.otherWitnesses.witnessItems.map(item => new OtherWitnessItems(item));
      return new OtherWitnesses(otherWitnesses.option, otherWitnesses.witnessItems);
    }
    return new OtherWitnesses();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveOtherWitnesses = async (claimId: string, form: OtherWitnesses) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    claim.directionQuestionnaire.otherWitnesses = form;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getOtherWitnesses,
  saveOtherWitnesses,
};
