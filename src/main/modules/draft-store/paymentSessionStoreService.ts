import {app} from '../../app-instance';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('paymentSessionStoreService');

export const saveUserId = async (claimId: string, userId: string) => {
  try {
    await app.locals.draftStoreClient.set(claimId + 'userIdForPayment', userId);
    logger.info('Draft store claim id ' + claimId + ' user id ' + userId);
  } catch (err) {
    logger.error('Error while saving the userid for payment confirmation ' + err);
    throw err;
  }
};

export const getUserId = async (claimId: string): Promise<string> => {
  try {
    return await app.locals.draftStoreClient.get(claimId + 'userIdForPayment');
  } catch (err) {
    logger.error('Error while getting the userid for payment confirmation ' + err);
    throw err;
  }
};

export const deleteUserId = async (claimId: string): Promise<void> => {
  try {
    await app.locals.draftStoreClient.del(claimId + 'userIdForPayment');
  } catch (err) {
    logger.error('Error while deleting the userid for payment confirmation ' + err);
    throw err;
  }
};

export const saveOriginalPaymentConfirmationUrl = async (originalUrl: string) => {

  const claimId = getClaimId(originalUrl);
  logger.info('Claim id ', claimId);
  if (!claimId) {
    logger.info('claim id does not exist from payment confirmation url ', originalUrl);
  } else {
    const userId = await getUserId(claimId);
    logger.info('User id ', userId);
    if (!userId) {
      logger.info('user id does not exist from claim id ', claimId);
    } else {
      try {
        await app.locals.draftStoreClient.set(userId + 'userIdForPayment', originalUrl);
      } catch (err) {
        logger.error('Error while saving the original payment confirmation url ' + err);
        throw err;
      }
    }
  }
};

export const getPaymentConfirmationUrl = async (userId: string): Promise<string> => {
  try {
    return await app.locals.draftStoreClient.get(userId + 'userIdForPayment');
  } catch (err) {
    logger.error('Error while getting the payment confirmation url ' + err);
    throw err;
  }
};

export const deletePaymentConfirmationUrl = async (userId: string): Promise<void> => {
  try {
    await app.locals.draftStoreClient.del(userId + 'userIdForPayment');
  } catch (err) {
    logger.error('Error while deleting the payment confirmation url ' + err);
    throw err;
  }
};

const getClaimId = (originalUrl: string) => {
  const regex = /\/(\d{16})\//;
  const match = originalUrl?.match(regex);
  if (match && match.length >=2 && match[1].length === 16) {
    return match[1];
  }
};
