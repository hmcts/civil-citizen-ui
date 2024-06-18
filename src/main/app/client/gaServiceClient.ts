import Axios, {AxiosInstance, AxiosResponse} from 'axios';
import {AppRequest} from 'common/models/AppRequest';
import {EventDto} from 'models/gaEvents/eventDto';
import {CCDGeneralApplication} from 'models/gaEvents/eventDto';
import {ApplicationEvent} from 'models/gaEvents/applicationEvent';
import {GeneralApplicationResponse} from 'models/generalApplicationResponse';
import {Application} from 'models/application';
import {GA_FEES_PAYMENT_STATUS_URL, GA_FEES_PAYMENT_URL, GA_SERVICE_SUBMIT_EVENT} from 'client/gaServiceUrls';
import {PaymentInformation} from 'models/feePayment/paymentInformation';
import {plainToInstance} from 'class-transformer';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('gaServiceClient');

const convertResponseToApplication = (caseDetails: GeneralApplicationResponse): Application => {
  const application: Application = new Application();
  return application;
};

export class GaServiceClient {
  client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = Axios.create({
      baseURL,
    });
  }

  getConfig(req: AppRequest) {
    return {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${req.session?.user?.accessToken}`,
      },
    };
  }

  async submitEvent(event: ApplicationEvent, claimId: string, updatedApplication?: CCDGeneralApplication, req?: AppRequest): Promise<Application> {
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
}
