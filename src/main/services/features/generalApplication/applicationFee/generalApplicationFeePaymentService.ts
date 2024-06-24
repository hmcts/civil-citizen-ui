import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {PaymentInformation} from 'models/feePayment/paymentInformation';
import {GaServiceClient} from 'client/gaServiceClient';
const generalAppApiBaseUrl = config.get<string>('services.generalApplication.url');
const gaServiceClient: GaServiceClient = new GaServiceClient(generalAppApiBaseUrl);

export const getGaFeePaymentRedirectInformation = async (claimId: string, req: AppRequest): Promise<PaymentInformation> => {

  return await gaServiceClient.getGaFeePaymentRedirectInformation(claimId, req);

};

export const getGaFeePaymentStatus = async (claimId: string, paymentReference: string, req: AppRequest): Promise<PaymentInformation> => {

  return await gaServiceClient.getGaFeePaymentStatus(claimId, paymentReference, req);

};