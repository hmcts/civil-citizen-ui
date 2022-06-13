// import * as config from 'config';
import Axios, {AxiosInstance, AxiosResponse} from 'axios';
// import {AssertionError} from 'assert';
import {AppRequest} from '../../common/models/AppRequest';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('serviceAuthProviderClient');

// const dmStoreBaseUrl = config.get<string>('services.dmStore.url');
// const dmStoreBaseUrl = 'http://localhost:4506';

export class ServiceAuthProviderClient {
  client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = Axios.create({
      baseURL,
    });
  }

  getConfig(req: AppRequest) {
    // TODO : update here
    // const serviceauthcode = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ4dWlfd2ViYXBwIiwiZXhwIjoxNjU0MDk1MTU3fQ.jzeoPkH_vyWFq4f3YicdyzJ2QZNUAv6YX8saJY14uAuDBjtqoGdO93KFfVG4Ba4V0Tbjajf41ey3ZpIOGeypoQ';
    return {
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${req.session?.user?.accessToken}`,
        // 'serviceauthorization': `Bearer ${serviceauthcode}`,
        // 'user-id': 'anyone@gmail.com',
        // 'classification': 'PUBLIC',
        // 'user-roles': 'caseworker',

      },
    };
  }

  async getServiceAuthorisationToken(req: AppRequest): Promise<Buffer> {
    // const options = this.getConfig(req);
    const JWTtokenGenerationUrl = '/testing-support/lease';
    // TODO : should be replaced with civil_citizen_ui
    const reqBody = {
      microservice: 'xui_webapp',
    };

    
    try {
      const response: AxiosResponse<object> = await this.client.post(JWTtokenGenerationUrl, reqBody);

      return response.data as Buffer;
    } catch (err: unknown) {
      logger.error(err);
    }
  }

}

