import Axios, {AxiosError, AxiosInstance, AxiosResponse} from 'axios';
import {AppRequest} from 'common/models/AppRequest';
import {CCDGaHelpWithFees, CCDGeneralApplication, CCDRespondToApplication, EventDto} from 'models/gaEvents/eventDto';
import {ApplicationEvent} from 'models/gaEvents/applicationEvent';
import {GeneralApplicationResponse} from 'models/generalApplicationResponse';
import {Application} from 'models/application';
import {
  GA_GET_APPLICATION_URL,
  GA_BY_CASE_URL,
  GA_FEES_PAYMENT_STATUS_URL,
  GA_FEES_PAYMENT_URL,
  GA_SERVICE_CASES_URL,
  GA_SERVICE_SUBMIT_EVENT,
} from 'client/gaServiceUrls';
import {PaymentInformation} from 'models/feePayment/paymentInformation';
import {plainToInstance} from 'class-transformer';
import {ApplicationResponse} from 'common/models/generalApplication/applicationResponse';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('gaServiceClient');

const convertResponseToApplication = (caseDetails: GeneralApplicationResponse): Application => {
  const application: Application = new Application();
  return application;
};

export class GaServiceClient {
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

    // Add request interceptor for logging
    if (this.client && this.client.interceptors) {
      this.client.interceptors.request.use(
        (config) => {
          try {
            const requestLog = {
              timestamp: new Date().toISOString(),
              method: config.method?.toUpperCase(),
              url: config.url,
              baseURL: config.baseURL,
              fullURL: `${config.baseURL}${config.url}`,
              headers: {
                ...config.headers,
                // Mask sensitive headers
                Authorization: config.headers?.Authorization ? '[REDACTED]' : undefined,
              },
              data: config.data,
            };
            logger.info('GA Request:', JSON.stringify(requestLog, null, 2));
          } catch (err) {
            // Silently fail if logging fails
          }
          return config;
        },
        (error) => {
          try {
            logger.error('GA Request Error:', error);
          } catch (err) {
            // Silently fail if logging fails
          }
          return Promise.reject(error);
        },
      );

      // Add response interceptor for logging
      this.client.interceptors.response.use(
        (response) => {
          try {
            const responseLog = {
              timestamp: new Date().toISOString(),
              status: response.status,
              statusText: response.statusText,
              url: response.config.url,
              fullURL: `${response.config.baseURL}${response.config.url}`,
              headers: response.headers,
              dataSize: response.data ? JSON.stringify(response.data).length : 0,
              // Only log data for non-document responses
              data: isDocumentInstance ? '[BINARY DATA]' : response.data,
            };
            logger.info('GA Response:', JSON.stringify(responseLog, null, 2));
          } catch (err) {
            // Silently fail if logging fails
          }
          return response;
        },
        (error: AxiosError) => {
          try {
            const errorLog = {
              timestamp: new Date().toISOString(),
              message: error.message,
              url: error.config?.url,
              fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : undefined,
              status: error.response?.status,
              statusText: error.response?.statusText,
              responseData: error.response?.data,
            };
            logger.error('GA Response Error:', JSON.stringify(errorLog, null, 2));
          } catch (err) {
            // Silently fail if logging fails
          }
          return Promise.reject(error);
        },
      );
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

  async submitRespondToApplicationEvent(applicationId: string, generalApplication: CCDRespondToApplication, req?: AppRequest): Promise<Application> {
    return this.submitEvent(ApplicationEvent.RESPOND_TO_APPLICATION, applicationId, generalApplication, req);
  }

  async submitRespondToApplicationEventForUrgent(applicationId: string, generalApplication: CCDRespondToApplication, req?: AppRequest): Promise<Application> {
    return this.submitEvent(ApplicationEvent.RESPOND_TO_APPLICATION_URGENT_LIP, applicationId, generalApplication, req);
  }

  async submitEvent(event: ApplicationEvent, claimId: string, updatedApplication?: CCDGeneralApplication | CCDRespondToApplication | CCDGaHelpWithFees, req?: AppRequest): Promise<Application> {

    const config = this.getConfig(req);
    const userId = req.session?.user?.id;
    const data: EventDto = {
      event: event,
      caseDataUpdate: updatedApplication,
    };
    try {
      const response = await this.client.post(GA_SERVICE_SUBMIT_EVENT // no-sonar
        .replace(':submitterId', userId)
        .replace(':caseId', claimId), data, config);// nosonar
      const appResponse = response.data as GeneralApplicationResponse;
      return convertResponseToApplication(appResponse);
    } catch (err: unknown) {
      logger.error(`Error when submitting event ${event}`);
      throw err;
    }
  }

  async getGaFeePaymentRedirectInformation(claimId: string, req: AppRequest): Promise<PaymentInformation> {
    const config = this.getConfig(req);
    try {
      const response = await this.client.post(GA_FEES_PAYMENT_URL.replace(':claimId', claimId),'', config);
      return plainToInstance(PaymentInformation, response.data);
    } catch (err: unknown) {
      logger.error('Error when getting fee payment redirect information');
      throw err;
    }
  }

  async getGaFeePaymentStatus(claimId: string, paymentReference: string, req: AppRequest): Promise<PaymentInformation> {
    const config = this.getConfig(req);
    try {
      const response: AxiosResponse<object> = await this.client.get(GA_FEES_PAYMENT_STATUS_URL.replace(':claimId', claimId).replace(':paymentReference', paymentReference), config);

      return plainToInstance(PaymentInformation, response.data);
    } catch (err: unknown) {
      logger.error('Error when getting fee payment status');
      throw err;
    }
  }

  async getApplications(req: AppRequest): Promise<ApplicationResponse[]> {
    const config = this.getConfig(req);
    let applications: ApplicationResponse[] = [];
    try {
      const response = await this.client.post(GA_SERVICE_CASES_URL, {match_all: {}}, config);
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

  async getApplicationsByCaseId(caseId: string, req: AppRequest): Promise<ApplicationResponse[]> {
    const config = this.getConfig(req);
    try {
      const response = await this.client.get(constructResponseUrlWithIdParams(caseId, GA_BY_CASE_URL), config);
      return response.data?.cases?.sort((a: any, b: any) => {
        return new Date(a.created_date).getTime() - new Date(b.created_date).getTime();
      });
    } catch (err) {
      logger.error('Error when getApplicationsByCaseId', err);
      throw err;
    }
  }
}
