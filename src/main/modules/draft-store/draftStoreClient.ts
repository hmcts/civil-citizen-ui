import {app} from '../../app';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {Claim} from 'models/claim';

export class DraftStoreClient {

  public async getDraftClaimFromStore(claimId: string): Promise<Claim> {
    const storedClaim: CivilClaimResponse = await app.locals.draftStoreClient.get(claimId);
    console.log(storedClaim.case_data);
    return storedClaim.case_data;
  }
  public async saveDraftClaim(claimId: string, claim:Claim) {
    const storedClaim = await app.locals.draftStoreClient.get(claimId);
    storedClaim.case_data = claim;
    const draftStoreClient = app.locals.draftStoreClient;
    draftStoreClient.set(claimId, storedClaim);
  }
}
