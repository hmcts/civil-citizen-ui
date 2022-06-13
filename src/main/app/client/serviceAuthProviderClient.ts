import Axios, {AxiosInstance, AxiosResponse} from 'axios';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('serviceAuthProviderClient');

export class ServiceAuthProviderClient {
  client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = Axios.create({
      baseURL,
    });
  }

  getConfig() {
    return {
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  async getServiceAuthorisationToken(): Promise<string> {
    const options = this.getConfig();
    const serviceAuthTokenGeneratorUrl = '/testing-support/lease';
    // TODO : should be replaced with civil_citizen_ui when civil citizen ui is given permission to access prf documents created by xui
    const reqBody = {
      microservice: 'xui_webapp',
    };
    try {
      const response: AxiosResponse<string> = await this.client.post(serviceAuthTokenGeneratorUrl, reqBody, options);
      return response.data;
    } catch (err: unknown) {
      logger.error(err);
    }
  }

}

