import {HelpWithFees} from '../../../../../common/form/models/claim/details/helpWithFees';
import {getCaseDataFromStore, saveDraftClaim} from '../../../../../modules/draft-store/draftStoreService';
import { getClaimDetails } from '../claimDetailsService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('Claim - Help with fees');

export const getHelpWithFees = async (claimId: string): Promise<HelpWithFees> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    return caseData.claimDetails?.helpWithFees ?
      new HelpWithFees(caseData.claimDetails.helpWithFees.helpWithFeesReferenceOption) :
      new HelpWithFees();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveHelpWithFees = async (claimId: string, value: any, helpWithFeesPropertyName: string) => {
  try {
    const caseData: any = await getCaseDataFromStore(claimId);
    caseData.claimDetails = await getClaimDetails(claimId);
    if (caseData.claimDetails.helpWithFees) {
      caseData.claimDetails.helpWithFees[helpWithFeesPropertyName] = value;
    } else {
      const helpWithFees: any = new HelpWithFees();
      helpWithFees[helpWithFeesPropertyName] = value;
      caseData.claimDetails.helpWithFees = helpWithFees;
    }
    await saveDraftClaim(claimId, caseData);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
