
import Axios, {AxiosInstance} from 'axios';
import {AppRequest} from 'models/AppRequest';
import {
  CIVIL_GENERAL_APPLICATIONS_SUBMIT_EVENT,
} from './generalApplicationUrls';
import {CaseEvent} from 'models/generalApplication/events/caseEvent';
import {ApplicationUpdate, EventDto} from 'models/generalApplication/events/eventDto';
import {Application} from 'models/generalApplication/application';
import {AssertionError} from 'assert';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {translateCCDCaseDataToCUIModel} from 'services/translation/convertToCUI/generalApplication/cuiTranslation';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('generalApplicationClient');

const convertCaseToApplication = (caseDetails: ApplicationResponse): Application => {
  const claim: Application = translateCCDCaseDataToCUIModel(caseDetails.case_data);
  claim.ccdState = caseDetails.state;
  claim.id = caseDetails.id;
  claim.lastModifiedDate = caseDetails.last_modified;
  return claim;
};

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
      const response = await this.client.post(`/cases/`, {match_all: {}}, config);
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

  async retrieveApplicationDetails(claimId: string, req: AppRequest): Promise<Application> {
    const config = this.getConfig(req);
    try {
      const response = await this.client.get('/cases/${claimId}', config);// nosonar
      if (!response.data) {
        throw new AssertionError({message: 'Claim details not available!'});
      }
      const caseDetails: ApplicationResponse = response.data;
      return convertCaseToApplication(caseDetails);
    } catch (err: unknown) {
      logger.error('Error when retrieving claim details');
      throw err;
    }
  }

  async submitEvent(event: CaseEvent, claimId: string, updatedClaim?: ApplicationUpdate, req?: AppRequest): Promise<Application> {
    const config = this.getConfig(req);
    const userId = req.session?.user?.id;
    const data: EventDto = {
      event: event,
      caseDataUpdate: updatedClaim,
    };
    try {
      const response = await this.client.post(CIVIL_GENERAL_APPLICATIONS_SUBMIT_EVENT // nosonar
        .replace(':submitterId', userId)
        .replace(':caseId', claimId), data, config);// nosonar
        const application = response.data as Application;
        return application;
    } catch (err: unknown) {
      logger.error(`Error when submitting event ${event}`);
      throw err;
    }
  }
}