import {Claim} from '../../common/models/claim';
import Axios, {AxiosInstance, AxiosResponse} from 'axios';
import {AssertionError} from 'assert';
import {AppRequest} from 'models/AppRequest';

export class CivilServiceClient {
  client: AxiosInstance;

  constructor(baseURL: string) {

    this.client = Axios.create({
      baseURL,

    });
  }

  async retrieveByDefendantId(req: AppRequest): Promise<Claim[]> {
    console.log('civilServiceClient::\n' + req.session.user.accessToken);
    const claims: Claim[] = [];
    this.client.post('/cases',
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${req.session.user.accessToken}`,
        },
        data: {'match_all': {}},
      }).then(response => {
      console.log(response);
      const objects: Claim[] = response.data;
      objects.forEach((_claim) => {
        const claim: Claim = Object.assign(new Claim(), _claim);
        claims.push(claim);
      });
    }).catch(error => {
      console.log(error.message);
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
