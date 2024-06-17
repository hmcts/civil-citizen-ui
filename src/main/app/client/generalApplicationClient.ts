import Axios, {AxiosInstance} from 'axios';
import {AppRequest} from 'models/AppRequest';
import {
  CIVIL_GENERAL_APPLICATIONS_BY_CASE_URL,
  CIVIL_GENERAL_APPLICATIONS_URL,
} from './generalApplicationUrls';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {Application} from 'models/generalApplication/application';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

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
      applications = response.data?.cases?.map((application: ApplicationResponse) => {
        const caseData = Object.assign(new Application(), application.case_data);
        return new ApplicationResponse(application.id, caseData, application.state, application.last_modified, application.created_date);
      });
      return applications;
    } catch (err) {
      logger.error('Error when getApplications');
      throw err;
    }
  }

  async getApplicationsByCaseId(caseId: string, req: AppRequest): Promise<ApplicationResponse[]> {
    const config = this.getConfig(req);
    try {
      const response = await this.client.get(constructResponseUrlWithIdParams(caseId, CIVIL_GENERAL_APPLICATIONS_BY_CASE_URL), config);
      return response.data.cases;
    } catch (err) {
      logger.error('Error when getApplicationsByCaseId', err);
      throw err;
    }
  }
}
