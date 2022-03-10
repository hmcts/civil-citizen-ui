import {app} from '../../app';
import {CivilClaimResponse} from '../../common/models/civilClaimResponse';
import {Claim} from '../../common/models/claim';

export class DraftStoreService {
  /**
   * Gets civil claim response object with claim from draft store
   * @param claimId
   * @returns claim from redis or undefined when no there is no data for claim id
   */
  public async getDraftClaimFromStore(claimId: string): Promise<CivilClaimResponse> {
    const dataFromRedis = await app.locals.draftStoreClient.get(claimId);
    const claim = Object.assign(JSON.parse(dataFromRedis), new CivilClaimResponse());
    return claim;
  }

  /**
   * Saves claim in Draft store. If the claim does not exist
   * it creates a new CivilClaimResponse object and passes the claim in parameter to it
   * then saves the new data in redis.
   * If claim exists then it updates the claim with the new claim passed in parameter
   * @param claimId
   * @param claim
   */
  public async saveDraftClaim(claimId: string, claim:Claim) {
    let storedClaimResponse = await this.getDraftClaimFromStore(claimId);
    if(!storedClaimResponse){
      storedClaimResponse = this.createNewCivilClaimResponse(claimId);
    }
    storedClaimResponse.case_data = claim;
    const draftStoreClient = app.locals.draftStoreClient;
    draftStoreClient.set(claimId, JSON.stringify(storedClaimResponse));
  }

  private createNewCivilClaimResponse(claimId: string) {
    const storedClaimResponse = new CivilClaimResponse();
    storedClaimResponse.id = claimId;
    return storedClaimResponse;
  }
}
