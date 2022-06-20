import config from 'config';
import Axios, {AxiosInstance, AxiosResponse} from 'axios';
import {authenticator} from 'otplib';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('serviceAuthProviderClient');

const serviceAuthProviderUrl = config.get<string>('services.serviceAuthProvider.url');
const client: AxiosInstance = Axios.create({baseURL: serviceAuthProviderUrl});

const generateServiceToken = async (microservice: string, s2sSecret: string): Promise<string> => {

  try {

    // TODO: re-use existing service access token if still valid instead of generating a new one each time
    const oneTimePassword = authenticator.generate(s2sSecret);

    const leaseUrl = `${serviceAuthProviderUrl}/lease`;
    logger.info(`leaseUrl: ${leaseUrl}`);

    logger.info(`About to generate Service Authorisation Token for: ${microservice}`);
    const response: AxiosResponse<string> = await client.post(
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
};

export {
  generateServiceToken,
};
