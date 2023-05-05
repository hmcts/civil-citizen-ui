import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {UploadDocuments} from 'form/models/caseProgression/uploadDocumentstype';
import {ClaimantOrDefendant} from 'models/partyType';
import {CaseProgression} from 'form/models/caseProgression/caseProgression';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('supportRequiredService');

export const getDocuments = async (claimId: string,claimantOrDefendant: ClaimantOrDefendant): Promise<UploadDocuments> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    if (caseData?.caseProgression?.DefendantUploadDocuments && claimantOrDefendant===ClaimantOrDefendant.DEFENDANT) {
      return caseData?.caseProgression?.DefendantUploadDocuments ? caseData?.caseProgression.DefendantUploadDocuments : new UploadDocuments();
    }
    else if (caseData?.caseProgression?.ClaimantUploadDocuments && claimantOrDefendant===ClaimantOrDefendant.CLAIMANT) {
      return caseData?.caseProgression?.ClaimantUploadDocuments ? caseData?.caseProgression.ClaimantUploadDocuments : new UploadDocuments();
    }
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
export const saveCaseProgression = async (claimId: string, value: any, caseProgressionPropertyName: string, parentPropertyName?: string): Promise<void> => {
  try {
    const claim: any = await getCaseDataFromStore(claimId);

    if (!claim.caseProgression) {
      claim.caseProgression = new CaseProgression();
    }
    if (claim?.caseProgression) {
      if (parentPropertyName && claim.caseProgression[parentPropertyName]) {
        claim.caseProgression[parentPropertyName][caseProgressionPropertyName] = value;
      } else if (parentPropertyName && !claim.caseProgression[parentPropertyName]) {
        claim.caseProgression[parentPropertyName] = {[caseProgressionPropertyName]: value};
      } else {
        claim.caseProgression[caseProgressionPropertyName] = value;
      }
    } else {
      const caseProgression: any = new CaseProgression();
      if (parentPropertyName) {
        caseProgression[parentPropertyName] = {[caseProgressionPropertyName]: value};
      } else {
        caseProgression[caseProgressionPropertyName] = value;
      }
      claim.caseProgression = caseProgression;
    }
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
