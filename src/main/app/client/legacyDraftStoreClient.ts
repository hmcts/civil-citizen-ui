import config from 'config';
import Axios from 'axios';
import {authenticator} from 'otplib';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('legacyDraftStoreClient');

export class LegacyDraftStoreClient {
  // private readonly draftStoreUrl: string;
  private readonly cmcS2sSecret: string;
  private readonly primarySecret: string;
  private readonly secondarySecret: string;
  private readonly serviceAuthProviderUrl: string;
  private readonly microserviceName: string;

  constructor() {
    // this.draftStoreUrl = config.get<string>('services.draftStore.legacy.url');
    this.cmcS2sSecret = config.get<string>('services.serviceAuthProvider.cmcS2sSecret');
    this.primarySecret = config.get<string>('services.draftStore.legacy.s2s.primarySecret');
    this.secondarySecret = config.get<string>('services.draftStore.legacy.s2s.secondarySecret');
    this.serviceAuthProviderUrl = config.get<string>('services.serviceAuthProvider.url');
    this.microserviceName = config.get<string>('services.draftStore.legacy.s2s.microserviceName');
  }


  generateServiceToken(): string {

    logger.info(`CMC S2S secret: ${this.cmcS2sSecret}`);

    const oneTimePassword = authenticator.generate(this.cmcS2sSecret);
    logger.info(`microserviceName: ${this.microserviceName}`);
    logger.info(`oneTimePassword: ${oneTimePassword}`);
    let serviceToken: string;

    const leaseUrl = `${this.serviceAuthProviderUrl}/lease`;
    logger.info(`leaseUrl: ${leaseUrl}`);

    Axios.post(
      leaseUrl,
      {
        microservice: this.microserviceName,
        oneTimePassword: oneTimePassword,
      }).then(response => {
      serviceToken = response.data;
      logger.info(`Generated Service Authorisation Token: ${serviceToken}`);
      return serviceToken;
    }).catch(error => {
      logger.error(error.message);
    });
    return serviceToken;
  }

  secretsAsHeader(): string {
    return this.secondarySecret ? `${this.primarySecret}, ${this.secondarySecret}` : this.primarySecret;
  }

  // TODO: implement find()
}
