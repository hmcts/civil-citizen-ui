import {generateRedisKey, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {CertificateOfSatisfactionOrCancellation} from 'models/generalApplication/CertificateOfSatisfactionOrCancellation';
import {Request} from 'express';
import {getClaimById} from 'modules/utilityService';
import {AppRequest} from 'models/AppRequest';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('defendantFinalPaymentDateService');

export const getCertificateOfSatisfactionOrCancellation = async (req: Request): Promise<CertificateOfSatisfactionOrCancellation> => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    if (!claim.generalApplication?.certificateOfSatisfactionOrCancellation) return new CertificateOfSatisfactionOrCancellation();
    return claim.generalApplication.certificateOfSatisfactionOrCancellation;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveCertificateOfSatisfactionOrCancellation = async (req: Request, value: any, propertyName: keyof CertificateOfSatisfactionOrCancellation): Promise<void> => {
  try {
    const claimId = req.params.id;
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getClaimById(claimId, req, true);
    if (!claim.generalApplication) {
      claim.generalApplication = new GeneralApplication();
    }
    if (!claim.generalApplication.certificateOfSatisfactionOrCancellation) {
      claim.generalApplication.certificateOfSatisfactionOrCancellation = new CertificateOfSatisfactionOrCancellation();
    }
    claim.generalApplication.certificateOfSatisfactionOrCancellation[propertyName] = value;

    await saveDraftClaim(redisKey, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

