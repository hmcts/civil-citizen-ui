import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {PaymentInformation} from 'models/caseProgression/hearingFee/paymentInformation';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

export const getFeePaymentRedirectInformation = async (claimId: string, feeType: string, req: AppRequest): Promise<PaymentInformation> => {

    return await civilServiceClient.getFeePaymentRedirectInformation(claimId, feeType, req);

};
