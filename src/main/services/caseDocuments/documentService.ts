import {Claim} from 'models/claim';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';

export const saveDocumentsToExistingClaim = async (id: string, claimFromCcd: Claim):Promise<void> => {
  const claimFromRedis = await getCaseDataFromStore(id, true);
  claimFromRedis.systemGeneratedCaseDocuments = claimFromCcd.systemGeneratedCaseDocuments;
  await saveDraftClaim(id, claimFromRedis, true);
};
