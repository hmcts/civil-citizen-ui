import config from 'config';
import Axios, {AxiosInstance, AxiosResponse} from 'axios';
import {authenticator} from 'otplib';

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

const serviceAuthProviderUrl = config.get<string>('services.serviceAuthProvider.baseUrl');
const client: AxiosInstance = Axios.create({baseURL: serviceAuthProviderUrl});

const generateServiceToken = async (microservice: string, s2sSecret: string): Promise<string> => {

  try {

    // TODO: re-use existing service access token if still valid instead of generating a new one each time
    const oneTimePassword = authenticator.generate(s2sSecret);

    logger.info(`About to generate Service Authorisation Token for: ${microservice}`);
    const response: AxiosResponse<string> = await client.post(
      '/lease',
      {
        microservice: microservice,
        oneTimePassword: oneTimePassword,
      });
    logger.info(`Service Authorisation Token generated for: ${microservice}`);

    return response.data;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  generateServiceToken,
};
