import {Claim} from 'models/claim';
import {UploadDocuments} from 'models/mediation/uploadDocuments/uploadDocuments';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {ClaimantResponse} from 'models/claimantResponse';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('freeMediationService');

const getUploadDocuments = async (claimId: string): Promise<UploadDocuments> => {
  try {
    const claim: Claim = await getCaseDataFromStore(claimId);
    if (claim.isClaimantIntentionPending()) {
      if (!claim.claimantResponse?.mediationUploadDocuments) return new UploadDocuments([]);
      return new UploadDocuments(claim.claimantResponse.mediationUploadDocuments.typeOfDocuments);
    } else {
      if (!claim.mediationUploadDocuments) return new UploadDocuments([]);
      return new UploadDocuments(claim.mediationUploadDocuments.typeOfDocuments);
    }
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveUploadDocument = async (claimId: string, value: any, uploadDocumentsPropertyName: keyof UploadDocuments): Promise<void> => {
  try {
    const claim: Claim = await getCaseDataFromStore(claimId);
    if (claim.isClaimantIntentionPending()) {
      if (!claim.claimantResponse) {
        claim.claimantResponse = new ClaimantResponse();
      }
      if (!claim.claimantResponse.mediationUploadDocuments) {
        claim.claimantResponse.mediationUploadDocuments = new UploadDocuments([]);
      }
      claim.claimantResponse.mediationUploadDocuments[uploadDocumentsPropertyName] = value;
    } else {
      if (!claim.mediationUploadDocuments) {
        claim.mediationUploadDocuments = new UploadDocuments([]);
      }
      claim.mediationUploadDocuments[uploadDocumentsPropertyName] = value;
    }
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {getUploadDocuments, saveUploadDocument};
