import Axios, {AxiosInstance} from 'axios';
import {AppRequest} from 'models/AppRequest';
import {
  CIVIL_GENERAL_APPLICATIONS_URL,
} from './generalApplicationUrls';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {Application} from 'models/generalApplication/application';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('generalApplicationClient');

export class GeneralApplicationClient {
  client: AxiosInstance;

  constructor(baseURL: string, isDocumentInstance?: boolean) {
    if (isDocumentInstance) {
      this.client = Axios.create({
        baseURL,
        responseType: 'arraybuffer',
        responseEncoding: 'binary',
      });
    } else {
      this.client = Axios.create({
        baseURL,
      });
    }
  }

  getConfig(req: AppRequest) {
    return {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${req.session?.user?.accessToken}`,
      },
    };
  }

  async getApplications(req: AppRequest): Promise<ApplicationResponse[]> {
    const config = this.getConfig(req);
    let applications: ApplicationResponse[] = [];
    try {
      const response = await this.client.post(CIVIL_GENERAL_APPLICATIONS_URL, {match_all: {}}, config);
      applications = response.data.cases.map((application: ApplicationResponse) => {
        const caseData = Object.assign(new Application(), application.case_data);
        return new ApplicationResponse(application.id, caseData, application.state, application.last_modified);
      });
      return applications;
    } catch (err) {
      logger.error('Error when getApplications');
      throw err;
    }
  }
}
