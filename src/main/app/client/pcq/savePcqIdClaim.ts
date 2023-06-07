import {
  getCaseDataFromStore,
  saveDraftClaim,
} from "modules/draft-store/draftStoreService";

export const savePcqIdClaim = async (pcqId: string, claimId: string) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    claim.pcqId = pcqId;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    throw error;
  }
};
