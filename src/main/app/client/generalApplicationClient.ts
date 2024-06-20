import Axios, {AxiosInstance} from 'axios';
import {AppRequest} from 'models/AppRequest';
import {CIVIL_GENERAL_APPLICATIONS_URL, GA_GET_APPLICATION_URL} from './generalApplicationUrls';
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
      applications = response.data.cases?.map((application: ApplicationResponse) => {
        const caseData = Object.assign(new Application(), application.case_data);
        return new ApplicationResponse(application.id, caseData, application.state, application.last_modified, application.created_date);
      });
      return applications;
    } catch (err) {
      logger.error('Error when getApplications');
      throw err;
    }
  }

  async getApplication(req: AppRequest, applicationId: string): Promise<ApplicationResponse> {
    const config = this.getConfig(req);
    try {
      const response = await this.client.get(GA_GET_APPLICATION_URL.replace(':caseId', applicationId), config);
      const caseData = Object.assign(new Application(), response.data.case_data);
      return new ApplicationResponse(response.data.id, caseData, response.data.state, response.data.last_modified, response.data.created_date);
    } catch (err) {
      logger.error('Error when getApplication with ID');
      throw err;
    }
  }
}
