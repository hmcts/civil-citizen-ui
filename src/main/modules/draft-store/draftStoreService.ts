import {app} from '../../app';
import {CivilClaimResponse} from '../../common/models/civilClaimResponse';
import {Claim} from '../../common/models/claim';

export class DraftStoreService {

  public async getDraftClaimFromStore(claimId: string): Promise<Claim> {
    const storedClaim: CivilClaimResponse = await app.locals.draftStoreClient.get(claimId);
    return storedClaim?.case_data;
  }

  public async saveDraftClaim(claimId: string, claim:Claim) {
    let storedClaim = await app.locals.draftStoreClient.get(claimId);
    if(!storedClaim){
      storedClaim = this.createNewClaim(claimId);
    }
    storedClaim.case_data = claim;
    const draftStoreClient = app.locals.draftStoreClient;
    draftStoreClient.set(claimId, storedClaim);
  }

  private createNewClaim(claimId: string) {
    const storedClaim = new CivilClaimResponse();
    storedClaim.id = claimId;
    return storedClaim;
  }
}
