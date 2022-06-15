import config from 'config';
import Axios, {AxiosInstance, AxiosResponse} from 'axios';
import {AssertionError} from 'assert';
import {ServiceAuthProviderClient} from './serviceAuthProviderClient';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('dmStoreClient');

const serviceAuthProviderClientBaseUrl = config.get<string>('services.serviceAuthProvider.url');
const serviceAuthProviderClient: ServiceAuthProviderClient = new ServiceAuthProviderClient(serviceAuthProviderClientBaseUrl);
export class DmStoreClient {
  client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = Axios.create({
      baseURL,
      responseType: 'arraybuffer',
      responseEncoding: 'binary',
    });
  }

  async getConfig() {
    const serviceauthToken = await serviceAuthProviderClient.getServiceAuthorisationToken();
    return {
      headers: {
        'Content-Type': 'application/pdf',
        'serviceauthorization': `Bearer ${serviceauthToken}`,
        'classification': 'PUBLIC',
        'user-roles': 'caseworker',
      },
    };
  }

  async retrieveDocumentByDocumentId(documentId: string): Promise<Buffer> {
    const options = await this.getConfig();
    const retrieveDocumentByIdUrl = `/documents/${documentId}/binary`;
    try {
      const response: AxiosResponse<object> = await this.client.get(retrieveDocumentByIdUrl, options);

      if (!response.data) {
        throw new AssertionError({message: 'Document is not available.'});
      }
      return response.data as Buffer;
    } catch (err: unknown) {
      logger.error(err);
    }
  }
}

