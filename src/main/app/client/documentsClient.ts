import * as config from 'config';
import Axios, {AxiosInstance, AxiosResponse} from 'axios';
import {AssertionError} from 'assert';
import {AppRequest} from '../../common/models/AppRequest';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('ciivilServiceClient');

const dmStoreBaseUrl = config.get('services.dmStore.url');

export class DocumentsClient {
  client: AxiosInstance;

  constructor(baseURL = `${dmStoreBaseUrl}/documents`) {
    this.client = Axios.create({
      baseURL,
      responseType: 'stream', // or 'blob'
    });
  }

  getConfig(req: AppRequest) {
    // TODO : update here
    return {
      headers: {
        'Content-Type': 'application/pdf',
        'Authorization': `Bearer ${req.session?.user?.accessToken}`,
      },
    };
  }

  async retrieveDocumentByDocumentId(documentId: string, req: AppRequest): Promise<Buffer> {
    const options = this.getConfig(req);
    try {
      const response: AxiosResponse<object> = await this.client.get(`/${documentId}/binary`, options);// nosonar

      if (!response.data) {
        throw new AssertionError({message: 'Document is not available.'});
      }
      // TODO : check what is return as response.data
      return response.data as Buffer;
    } catch (err: unknown) {
      logger.error(err);
    }
  }

}

