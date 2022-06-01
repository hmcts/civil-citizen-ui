// import * as config from 'config';
import Axios, {AxiosInstance, AxiosResponse} from 'axios';
import {AssertionError} from 'assert';
import {AppRequest} from '../../common/models/AppRequest';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('dmStoreClient');

// const dmStoreBaseUrl = config.get<string>('services.dmStore.url');
// const dmStoreBaseUrl = 'http://localhost:4506';
export class DmStoreClient {
  client: AxiosInstance;

  constructor(baseURL : string) {
    this.client = Axios.create({
      baseURL,
      responseType: 'arraybuffer', // or 'stream' or 'blob'
      responseEncoding: 'binary',
    });
  }

  getConfig(req: AppRequest) {
    // TODO : update here
    const serviceauthcode = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ4dWlfd2ViYXBwIiwiZXhwIjoxNjU0MDk1MTU3fQ.jzeoPkH_vyWFq4f3YicdyzJ2QZNUAv6YX8saJY14uAuDBjtqoGdO93KFfVG4Ba4V0Tbjajf41ey3ZpIOGeypoQ';
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

    const downloadUrl = `documents/${documentId}/binary`;
    try {
      const response: AxiosResponse<object> = await this.client.get(downloadUrl, options);

      if (!response.data) {
        throw new AssertionError({message: 'Document is not available.'});
      }
      return response.data as Buffer;
    } catch (err: unknown) {
      logger.error(err);
    }
  }

}

