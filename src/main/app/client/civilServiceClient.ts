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
    const claims: Claim[] = [];
    await this.client.post('/cases/',
      { match_all: {} },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${req.session.user.accessToken}`,
        },
      }).then(response => {
      const objects: Claim[] = response.data.cases;
      objects.forEach((_claim) => {
        console.log('_claim::\n' + _claim);
        const claim: Claim = Object.assign(new Claim(), _claim);
        console.log('Claim caseReference::\n' + claim.legacyCaseReference);
        claims.push(claim);
        console.log('Claims array::\n' + claims);
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
