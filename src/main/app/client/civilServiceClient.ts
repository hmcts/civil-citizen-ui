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
    const claims = Object.assign(new Claim(), response.data);
    return [claims];
  }
}
