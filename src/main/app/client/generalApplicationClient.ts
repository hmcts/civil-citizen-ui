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

  async getApplications(req: AppRequest): Promise<any[]> {
    const config = this.getConfig(req);
    let applications: ApplicationResponse[] = [];
    try {
      const response = await this.client.post(CIVIL_GENERAL_APPLICATIONS_URL, {match_all: {}}, config);
      applications = response.data?.cases?.map((application: ApplicationResponse) => {
        const caseData = Object.assign(new Application(), application.case_data);
        return new ApplicationResponse(application.id, caseData, application.state, application.last_modified, application.created_date);
      });
      return applications;
      // return [mock1, mock2, test]
     
    } catch (err) {
      logger.error('Error when getApplications');
      throw err;
    }
  }
}

// const mock1 = {
//   id: '1234567890',
//   case_data: {
//     applicationTypes: 'Adjourn a hearing', 
//   },
//   state: 'AWAITING_RESPONDENT_RESPONSE',
//   last_modified: '2024-05-29T14:39:28.483971',
//   created_date: '2024-05-29T14:39:28.483971',
// };

// const mock2 = {
//   id: '4564564564564564', 
//   created_date: '2024-05-29T14:39:28.483971', 
//   state: 'AWAITING_APPLICATION_PAYMENT', 
//   case_data:{
//     applicationTypes: 'Adjourn a hearing', 
//   },
// };

// const test = {
//   id: 1716993568476294,
//   created_date: "2024-05-29T14:39:28.483971",
//   state: "APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION",
//   case_data: {
//     applicationTypes: "Adjourn a hearing",
//   },
// };
