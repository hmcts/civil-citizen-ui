import {Claim} from '../../common/models/claim';
import Axios, {AxiosInstance, AxiosResponse} from 'axios';
import {AssertionError} from 'assert';
import {AppRequest} from '../../common/models/AppRequest';

export class CivilServiceClient {
  client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = Axios.create({
      baseURL,
    });
  }

  retrieveByDefendantId(req: AppRequest): Promise<Claim[]> {
    return this.client.post('/cases/',
      { match_all: {} },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${req.session.user.accessToken}`,
        },
      }).then(response => {
      const claims = response.data.cases.map((claim: any) => Object.assign(new Claim(), claim.case_data));
      return claims;
    }).catch(error => {
      console.log(error.message);
    });
  }

  async retrieveClaimDetails(claimId: string): Promise<Claim> {
    const response: AxiosResponse<object> = await this.client.get(`/cases/${claimId}`);
    if (!response.data) {
      throw new AssertionError({message: 'Claim details not available.'});
    }
    return response.data as Claim;
  }
}
