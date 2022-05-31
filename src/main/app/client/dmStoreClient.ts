// import * as config from 'config';
import Axios, {AxiosInstance, AxiosResponse} from 'axios';
import {AssertionError} from 'assert';
import {AppRequest} from '../../common/models/AppRequest';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('dmStoreClient');

// const dmStoreBaseUrl = config.get<string>('services.dmStore.url');
const dmStoreBaseUrl = 'http://localhost:4506/documents';
export class DmStoreClient {
  client: AxiosInstance;

  constructor(baseURL = `${dmStoreBaseUrl}/documents`) {
    this.client = Axios.create({
      baseURL,
      responseType: 'arraybuffer', // or 'stream' or 'blob'
      responseEncoding: 'binary',
    });
  }

  getConfig(req: AppRequest) {
    // TODO : update here
    const serviceauthcode = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ4dWlfd2ViYXBwIiwiZXhwIjoxNjU0MDEyOTE2fQ.5gQAmGi6KMnATQM8HqPAb8eUEQGswgIUs1TN8kPBBNRUiVukws5S-3zyxTndy2lH6Rl0vImNlKxfa8Rp5iz9bA';
    return {
      headers: {
        'Content-Type': 'application/pdf',
        // 'Authorization': `Bearer ${req.session?.user?.accessToken}`,
        'serviceauthorization': `Bearer ${serviceauthcode}`,
        'user-id': 'anyone@gmail.com',
        'classification': 'PUBLIC',
        'user-roles' : 'caseworker',

      },
    };
  }

  async retrieveDocumentByDocumentId(documentId: string, req: AppRequest): Promise<Buffer> {
    const options = this.getConfig(req);

    const hardCodedUrl = 'http://localhost:4506/documents/74bf213e-72dd-4908-9e08-72fefaed9c5c/binary'; 
    try {
      const response: AxiosResponse<object> = await this.client.get(hardCodedUrl, options);// nosonar

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

