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
    const claim = this.convertRedisData(dataFromRedis);
    return claim;
  }

  /**
   * Gets only case data.
   * @param claimId
   */
  public async getCaseDataFormStore(claimId: string): Promise<Claim> {
    const civilClaimResponse = await this.getDraftClaimFromStore(claimId);
    console.log(civilClaimResponse.id);
    return civilClaimResponse?.case_data;
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

  private convertRedisData(data:any): CivilClaimResponse{
    let jsonData = undefined;
    if(data){
      jsonData = JSON.parse(data);
    }
    return jsonData? Object.assign(jsonData, new CivilClaimResponse()): undefined;
  }
}
