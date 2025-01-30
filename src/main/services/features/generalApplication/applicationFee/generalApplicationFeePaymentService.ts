import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {PaymentInformation} from 'models/feePayment/paymentInformation';
import {GaServiceClient} from 'client/gaServiceClient';
import {CCDGaHelpWithFees} from 'models/gaEvents/eventDto';
import {ApplicationEvent} from 'models/gaEvents/applicationEvent';
const generalAppApiBaseUrl = config.get<string>('services.generalApplication.url');
const gaServiceClient: GaServiceClient = new GaServiceClient(generalAppApiBaseUrl);

export const getGaFeePaymentRedirectInformation = async (claimId: string, lang: string, req: AppRequest): Promise<PaymentInformation> => {

  return await gaServiceClient.getGaFeePaymentRedirectInformation(claimId,lang, req);

};

export const getGaFeePaymentStatus = async (claimId: string, paymentReference: string, req: AppRequest): Promise<PaymentInformation> => {

  return await gaServiceClient.getGaFeePaymentStatus(claimId, paymentReference, req);

};

export const triggerNotifyHwfEvent = async (gaCaseId: string, generalAppHelpWithFees: CCDGaHelpWithFees, req: AppRequest): Promise<void> => {

  await gaServiceClient.submitEvent(ApplicationEvent.NOTIFY_HELP_WITH_FEE, gaCaseId, generalAppHelpWithFees, req);
};

