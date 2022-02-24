import {Claim} from '../../common/models/claim';
import Axios, {AxiosInstance, AxiosResponse} from 'axios';
import { AssertionError } from 'assert';
import {app} from '../../app';

export class CivilServiceClient {
  client: AxiosInstance;

  constructor(baseURL: string) {

    this.client = Axios.create({
      baseURL,

    });
  }

  async retrieveByDefendantId(): Promise<Claim[]> {
    console.log('civilServiceClient::\n' + app.locals.token);
    const response: AxiosResponse<object> = await this.client.post('/cases',
      {
        headers: { Authorization: 'Bearer ' + app.locals.token,
        },
        data : {'match_all': {}},
      });
    console.log(response);
    const objects: Claim[] = response.data as Claim[];
    const claims: Claim[] = [];
    objects.forEach((_claim) => {
      const claim: Claim = Object.assign(new Claim(), _claim);
      claims.push(claim);
    });

    return claims;
  }

  async retrieveClaimDetails(claimId: string): Promise<Claim> {
    const response: AxiosResponse<object> = await this.client.get(`/cases/${claimId}`);
    if (!response.data) {
      throw new AssertionError({message: 'Claim details not available.'});
    }

    return response.data as Claim;

  }
}
