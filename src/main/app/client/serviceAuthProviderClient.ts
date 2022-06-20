import config from 'config';
import Axios, {AxiosInstance, AxiosResponse} from 'axios';
import {authenticator} from 'otplib';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('serviceAuthProviderClient');

export class ServiceAuthProviderClient {
  private readonly serviceAuthProviderUrl: string;
  private readonly client: AxiosInstance;

  constructor() {
    this.serviceAuthProviderUrl = config.get<string>('services.serviceAuthProvider.url');
    this.client = Axios.create({baseURL: this.serviceAuthProviderUrl});
  }


  async generateServiceToken(microservice: string, s2sSecret: string): Promise<string> {

    try {
      const oneTimePassword = authenticator.generate(s2sSecret);

      const leaseUrl = `${this.serviceAuthProviderUrl}/lease`;
      logger.info(`leaseUrl: ${leaseUrl}`);

      logger.info(`About to generate Service Authorisation Token for: ${microservice}`);
      const response: AxiosResponse<string> = await this.client.post(
        '/lease',
        {
          microservice: microservice,
          oneTimePassword: oneTimePassword,
        });
      logger.info(`Service Authorisation Token generated for: ${microservice}`);
      logger.info(`Generated Service Authorisation Token: ${response.data}`);

      return response.data;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}
