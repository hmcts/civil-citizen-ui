import config from 'config';
import Axios, {AxiosInstance, AxiosResponse} from 'axios';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('serviceAuthProviderClient');

const xuiMicroserviceName = config.get<string>('services.dmStore.microserviceName');
const serviceAuthTokenGeneratorUrl = config.get<string>('services.serviceAuthProvider.serviceAuthTokenGeneratorUrl');

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
    // TODO : should be replaced with civil_citizen_ui when civil citizen ui 
    // is given permission to access prf documents on dm - store created via Xui
    const reqBody = {
      microservice: xuiMicroserviceName,
    };
    try {
      const response: AxiosResponse<string> = await this.client.post(serviceAuthTokenGeneratorUrl, reqBody, options);
      return response.data;
    } catch (err: unknown) {
      logger.error(err);
    }
  }
}

