import {app} from '../../app-instance';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('paymentSessionStoreService');

export const saveUserId = async (claimId: string, userId: string) => {
  try {
    const existingUserId = await getUserId(claimId);
    if (existingUserId && existingUserId !== userId) {
      logger.warn(`Overwriting existing userId ${existingUserId} with ${userId} for claimId ${claimId}`);
    }

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

export const saveOriginalPaymentConfirmationUrl = async (userId: string, url: string) => {
  try {
    const existingUrl = await getPaymentConfirmationUrl(userId);
    if (existingUrl && existingUrl !== url) {
      logger.warn(`Overwriting existing payment confirmation url ${existingUrl} with ${url} for userId ${userId}`);
    }

    await app.locals.draftStoreClient.set(userId + 'userIdForPayment', url);
  } catch (err) {
    logger.error('Error while saving the original payment confirmation url ' + err);
    throw err;
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
