import {ClaimantResponse} from '../../../common/models/claimantResponse';
import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {GenericYesNo} from '../../../common/form/models/genericYesNo';
import {ClaimantResponseErrorMessages} from '../../../common/form/models/claimantResponse/claimantResponseErrorMessages';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantResponseService');

const getClaimantResponse = async (claimId: string): Promise<ClaimantResponse> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    return (claim?.claimantResponse) ? claim.claimantResponse : new ClaimantResponse();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveClaimantResponse = async (claimId: string, value: any, claimantResponsePropertyName: string, parentPropertyName?: string): Promise<void> => {
  try {
    const claim: any = await getCaseDataFromStore(claimId);
    if (claim.claimantResponse) {
      if (parentPropertyName && claim.claimantResponse[parentPropertyName]) {
        claim.claimantResponse[parentPropertyName][claimantResponsePropertyName] = value;
      } else if (parentPropertyName && !claim.claimantResponse[parentPropertyName]) {
        claim.claimantResponse[parentPropertyName] = {[claimantResponsePropertyName]: value};
      } else {
        claim.claimantResponse[parentPropertyName] = value;
      }
    } else {
      const claimantResponse: any = new ClaimantResponse();
      if (parentPropertyName) {
        claimantResponse[parentPropertyName] = {[claimantResponsePropertyName]: value};
      } else {
        claimantResponse[claimantResponsePropertyName] = value;
      }

      claim.claimantResponse = claimantResponse;
    }
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const getGenericOptionForm = (option: string, propertyName: string): GenericYesNo => {
  return new GenericYesNo(option, getClaimantResponseErrorMessage(propertyName));
};

const getClaimantResponseErrorMessage = (propertyName: string): string => {
  return (ClaimantResponseErrorMessages[propertyName as keyof typeof ClaimantResponseErrorMessages]) ?
    ClaimantResponseErrorMessages[propertyName as keyof typeof ClaimantResponseErrorMessages] :
    undefined;
};

export {
  getClaimantResponse,
  saveClaimantResponse,
  getGenericOptionForm,
};
