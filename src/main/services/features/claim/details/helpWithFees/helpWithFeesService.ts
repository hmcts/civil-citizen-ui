import {Claim} from '../../../../../common/models/claim';
import {HelpWithFees} from '../../../../../common/form/models/claim/details/helpWithFees';
import {getCaseDataFromStore, saveDraftClaim} from '../../../../../modules/draft-store/draftStoreService';
import {getClaimDetails} from '../claimDetailsService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('Claim - Help with fees');

export const getHelpWithFees = async (claimId: string): Promise<HelpWithFees> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    
    if (caseData.claimDetails?.helpWithFees){
      return new HelpWithFees(caseData.claimDetails.helpWithFees.option, caseData.claimDetails.helpWithFees.referenceNumber);
    } else {
      return new HelpWithFees();
    }

  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveHelpWithFees = async (claimId: string, helpWithFees: HelpWithFees): Promise<void> => {
  try {
    const caseData: Claim = await getCaseDataFromStore(claimId);
    caseData.claimDetails = await getClaimDetails(claimId);
    caseData.claimDetails.helpWithFees = helpWithFees;
    await saveDraftClaim(claimId, caseData);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
