import config from 'config';
import {AxiosInstance, AxiosResponse} from 'axios';
import {createAxiosInstanceWithLogging} from './axiosWithLogging';
import {AssertionError} from 'assert';
import {ServiceAuthProviderClient} from './serviceAuthProviderClient';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('dmStoreClient');

const serviceAuthProviderClientBaseUrl = config.get<string>('services.serviceAuthProvider.baseUrl');
const serviceAuthProviderClient: ServiceAuthProviderClient = new ServiceAuthProviderClient(serviceAuthProviderClientBaseUrl);
export class DmStoreClient {
  client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = createAxiosInstanceWithLogging({
      baseURL,
      responseType: 'arraybuffer',
      responseEncoding: 'binary',
    }, 'dmStoreClient');
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
      throw err;
    }
  }
}

