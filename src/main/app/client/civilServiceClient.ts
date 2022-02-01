import {Claim} from '../../common/models/claim';
import Axios, {AxiosInstance, AxiosResponse} from 'axios';

export class CivilServiceClient {
  client: AxiosInstance;

  constructor(baseURL: string) {
    //const token = 'eyJ0eXAiOiJKV1QiLCJ6aXAiOiJOT05FIiwia2lkIjoiYi9PNk92VnYxK3krV2dySDVVaTlXVGlvTHQwPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiYXV0aF9sZXZlbCI6MCwiYXVkaXRUcmFja2luZ0lkIjoiZmFkOWI1YmItYTJhOC00NDViLTg0NWEtODRhOTc5OWExNTRkIiwiaXNzIjoiaHR0cDovL2ZyLWFtOjgwODAvb3BlbmFtL29hdXRoMi9obWN0cyIsInRva2VuTmFtZSI6ImFjY2Vzc190b2tlbiIsInRva2VuX3R5cGUiOiJCZWFyZXIiLCJhdXRoR3JhbnRJZCI6ImNlZGYxOTRjLWU3ZDgtNGU5YS04NzczLTYzZGVhMTIxMTczMiIsImF1ZCI6ImNjZF9nYXRld2F5IiwibmJmIjoxNjQzMTg2OTQ5LCJncmFudF90eXBlIjoiYXV0aG9yaXphdGlvbl9jb2RlIiwic2NvcGUiOlsib3BlbmlkIiwicHJvZmlsZSIsInJvbGVzIl0sImF1dGhfdGltZSI6MTY0MzE4Njk0ODAwMCwicmVhbG0iOiIvaG1jdHMiLCJleHAiOjE2NDMyMTU3NDksImlhdCI6MTY0MzE4Njk0OSwiZXhwaXJlc19pbiI6Mjg4MDAsImp0aSI6ImNhZTE2ZjIwLTFhNGYtNDlkYy04MmE4LTAzMjk2ZWQ3YzE4MiJ9.nKpuXZtq5dddvRGsvuZ24MWVuzCzfWvffIS5psHWr1ibYN7BauPN3GWWgJILZCdOn7tFEpkI12ZEtK60dFcCeQ2eqEPZHBsWNceeWinvlD9vRYEJyIjxQYpUWsDFt5jcrxXjnguBtJAlJDdacsID971iZhGOZUmm-U1BSS2mJ8enodduFz1WIT3gc6wmgd73PBuInTvRZdymHpbTJV5cG9Kf2E6BetHYlIBuysukRcVr-dkedZ0fbShgFLgzh900h6lQXGD0bjUuDJG6x7YcudxT-5kNQ8Yoo8ctEs5KbuaNvtbMMOVWXbEDjtw79ieTNvx70mag4N1Fyt6DZfq3Rg';
    this.client = Axios.create({
      baseURL,
      //headers: { Authorization: `Bearer ${token}`},

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
    const response: AxiosResponse<object> = await this.client.get(`/cases/${claimId}`);
    try {
      const objects = response.data as Claim;
      return objects;
    }
    catch(error) {
      console.log(error);
    }
  }
}
