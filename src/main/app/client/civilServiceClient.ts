import {Claim} from '../../common/models/claim';
import Axios, { AxiosInstance, AxiosResponse } from 'axios';

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
    objects.map(item => {
      const claim: Claim = new Claim();
      claim.legacyCaseReference = item.legacyCaseReference;
      claim.applicant1 = item.applicant1;
      claim.totalClaimAmount = item.totalClaimAmount;
      claim.respondent1ResponseDeadline = item.respondent1ResponseDeadline;
      claims.push(claim);
    });

    return claims;
  }
}
