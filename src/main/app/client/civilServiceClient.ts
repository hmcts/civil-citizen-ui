import {Claim} from '../../common/models/claim';
import Axios, {AxiosInstance, AxiosResponse} from 'axios';
import { AssertionError } from 'assert';

export class CivilServiceClient {
  client: AxiosInstance;

  constructor(baseURL: string) {

    this.client = Axios.create({
      baseURL,

    });
  }

  async retrieveByDefendantId(): Promise<Claim[]> {
    const response: AxiosResponse<object> = await this.client.get('/cases');
    const objects: Claim[] = response.data as Claim[];
    const claims: Claim[] = [];
    objects.forEach((_claim) => {
      const claim: Claim = Object.assign(new Claim(), _claim);
      claims.push(claim);
    });

    return claims;
  }

  async retrieveClaimDetails(claimId: string): Promise<Claim> {
    try {
      const response: AxiosResponse<object> = await this.client.get(`/cases/${claimId}`);

      if (!response.data) {
        throw new AssertionError({ message: 'Claim details not available.' });
      }

      return response.data as Claim;

    } catch(err:any) {
      console.log(err);
    }
  }
}
