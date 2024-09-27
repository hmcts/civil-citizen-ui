import {generateRedisKey, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {CertificateOfSatisfactionOrCanceled} from 'models/generalApplication/CertificateOfSatisfactionOrCanceled';
import {Request} from 'express';
import {getClaimById} from 'modules/utilityService';
import {AppRequest} from 'models/AppRequest';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('defendantFinalPaymentDateService');

export const getCertificateOfSatisfactionOrCanceled = async (req: Request): Promise<CertificateOfSatisfactionOrCanceled> => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    if (!claim.generalApplication?.certificateOfSatisfactionOrCanceled) return new CertificateOfSatisfactionOrCanceled();
    return claim.generalApplication.certificateOfSatisfactionOrCanceled;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveCertificateOfSatisfactionOrCanceled = async (req: Request, value: any, propertyName: keyof CertificateOfSatisfactionOrCanceled): Promise<void> => {
  try {
    const claimId = req.params.id;
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getClaimById(claimId, req, true);
    if (!claim.generalApplication) {
      claim.generalApplication = new GeneralApplication();
    }
    if (!claim.generalApplication.certificateOfSatisfactionOrCanceled) {
      claim.generalApplication.certificateOfSatisfactionOrCanceled = new CertificateOfSatisfactionOrCanceled();
    }
    claim.generalApplication.certificateOfSatisfactionOrCanceled[propertyName] = value;

    await saveDraftClaim(redisKey, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

