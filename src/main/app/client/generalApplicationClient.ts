import Axios, {AxiosInstance} from 'axios';
import {AppRequest} from 'models/AppRequest';
import {
  CIVIL_GENERAL_APPLICATIONS_BY_CASE_URL,
  CIVIL_GENERAL_APPLICATIONS_URL,
} from './generalApplicationUrls';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {Application} from 'models/generalApplication/application';
// import { ApplicationState } from 'common/models/generalApplication/applicationSummary';
import { constructResponseUrlWithIdParams } from 'common/utils/urlFormatter';

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
    // let applications: ApplicationResponse[] = [];
    try {
      const response = await this.client.post(constructResponseUrlWithIdParams(caseId, CIVIL_GENERAL_APPLICATIONS_BY_CASE_URL), {match_all: {}}, config);
      // applications = response.data?.cases?.map((application: ApplicationResponse) => {
      //   const caseData = Object.assign(new Application(), application.case_data);
      //   return new ApplicationResponse(application.id, caseData, application.state, application.last_modified, application.created_date);
      // });
      // console.log(response.data);

      return response.data;
      // return [mock1]
    } catch (err) {
      logger.error('Error when getApplicationsByCaseId');
      throw err;
    }
  }
}

// const mock1 = {
//     id: '1718283169493783',
//     jurisdiction: 'CIVIL',
//     state: ApplicationState.AWAITING_APPLICATION_PAYMENT,
//     case_type_id: 'GENERALAPPLICATION',
//     created_date: '2024-06-13T12:52:49.448',
//     last_modified: '2024-06-13T12:53:04.909',
//     case_data: {
//         applicationTypes: 'Extend time'
//     },
//     security_classification: 'PUBLIC'
// }
  // id: '1234567890',
  // created_date: '2024-06-12 09:52:16.492',
  // last_modified: '2024-05-29T14:39:28.483971',
  // state: ApplicationState.AWAITING_RESPONDENT_RESPONSE,
  // case_data: {
  //   applicationTypes: 'Adjourn a hearing', 
  // },
// };
// const mock2 = {
//   id: '4564564564564564', 
//   created_date: '2024-05-29T14:39:28.483971',
//   last_modified: '2024-05-29T14:39:28.483971',
//   state: ApplicationState.AWAITING_APPLICATION_PAYMENT, 
//   case_data:{
//     applicationTypes: 'Adjourn a hearing', 
//   },
// };
// const test = {
//   id: '1716993568476294',
//   created_date: "2024-05-29T14:39:28.483971",
//   last_modified: '2024-05-29T14:39:28.483971',
//   state: ApplicationState.APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION,
//   case_data: {
//     applicationTypes: "Adjourn a hearing",
//   },
// };
