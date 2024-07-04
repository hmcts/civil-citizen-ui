import {AppRequest} from 'models/AppRequest';
import {GA_APPLY_HELP_WITH_FEE_SELECTION, GA_PAYMENT_SUCCESSFUL_URL, GA_PAYMENT_UNSUCCESSFUL_URL} from 'routes/urls';
import { getGaFeePaymentStatus } from '../applicationFee/generalApplicationFeePaymentService';
import { getClaimById } from 'modules/utilityService';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('applicationFeePaymentConfirmationService');

const success = 'Success';
const paymentCancelledByUser = 'Payment was cancelled by the user';
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);


export const getRedirectUrl = async (claimId: string, applicationId: string, req: AppRequest): Promise<string> => {
  try {
    const claim = await getClaimById(claimId, req, true);
    const paymentReference = claim.generalApplication?.applicationFeePaymentDetails?.paymentReference;
    const paymentStatus = await getGaFeePaymentStatus(applicationId, paymentReference, req);
    if(paymentStatus.status === success) {
      return GA_PAYMENT_SUCCESSFUL_URL;
    }

    const claimFromService = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    const genApps = claimFromService.generalApplications as Array<any>;
    const genAppId = genApps?.find(genApp => genApp.value?.caseLink?.CaseReference === applicationId)?.id;
    return (paymentStatus.errorDescription !== paymentCancelledByUser ?
      GA_PAYMENT_UNSUCCESSFUL_URL : GA_APPLY_HELP_WITH_FEE_SELECTION) + (genAppId ? `?id=${genAppId}` : '');
  }
  catch (error) {
    logger.error(error);
    throw error;
  }
};
