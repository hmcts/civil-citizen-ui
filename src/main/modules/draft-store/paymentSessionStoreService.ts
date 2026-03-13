import {app} from '../../app-instance';

const userIdForPayment = 'userIdForPayment';
const confirmationUrl = 'confirmationUrl';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('paymentSessionStoreService');

export const saveUserId = async (claimId: string, feeType: string, userId: string) => {
  try {
    const existingUserId = await getUserId(claimId, feeType);
    if (existingUserId && existingUserId !== userId) {
      logger.warn(`Overwriting existing userId ${existingUserId} with ${userId} for claimId ${claimId}`);
    }

    await app.locals.draftStoreClient.set(claimId + feeType + userIdForPayment, userId);
    logger.info('Draft store claim id ' + claimId + ' user id ' + userId);
  } catch (err) {
    logger.error('Error while saving the userid for payment confirmation ' + err);
    throw err;
  }
};

export const getUserId = async (claimId: string, feeType: string): Promise<string> => {
  try {
    let userId =  await app.locals.draftStoreClient.get(claimId + feeType + userIdForPayment);
    if(!userId){
      //Fallback to OLD key format for backward compatibility
      userId = await app.locals.draftStoreClient.get(claimId + userIdForPayment);
    }
    if(!userId){
      logger.warn(`User ID not found for claimId ${claimId} with ${feeType} `);
    }
    return userId;
  } catch (err) {
    logger.error('Error while getting the userid for payment confirmation ' + err);
    throw err;
  }
};

export const deleteUserId = async (claimId: string, feeType: string): Promise<void> => {
  try {
    await app.locals.draftStoreClient.del(claimId + feeType + userIdForPayment);
    await app.locals.draftStoreClient.del(claimId + userIdForPayment);
  } catch (err) {
    logger.error('Error while deleting the userid for payment confirmation ' + err);
    throw err;
  }
};

export const saveOriginalPaymentConfirmationUrl = async (userId: string, feeType: string, url: string) => {
  try {
    const existingUrl = await getPaymentConfirmationUrl(userId, feeType);
    if (existingUrl && existingUrl !== url) {
      logger.warn(`Overwriting existing payment confirmation url ${existingUrl} with ${url} for userId ${userId}`);
    }

    await app.locals.draftStoreClient.set(userId + feeType + confirmationUrl, url);
  } catch (err) {
    logger.error('Error while saving the original payment confirmation url ' + err);
    throw err;
  }
};

export const getPaymentConfirmationUrl = async (userId: string, feeType: string): Promise<string> => {
  try {
    let url =  await app.locals.draftStoreClient.get(userId + feeType + confirmationUrl);
    if(!url){
      //Fallback to OLD key format for backward compatibility
      url =  await app.locals.draftStoreClient.get(userId + userIdForPayment);
    }
    if(!url){
      logger.warn(`Confirmation Url not found for userId ${userId} with ${feeType} `);
    }
    return url;
  } catch (err) {
    logger.error('Error while getting the payment confirmation url ' + err);
    throw err;
  }
};

export const deletePaymentConfirmationUrl = async (userId: string, feeType: string): Promise<void> => {
  try {
    await app.locals.draftStoreClient.del(userId + feeType + confirmationUrl);
    await app.locals.draftStoreClient.del(userId + userIdForPayment);
  } catch (err) {
    logger.error('Error while deleting the payment confirmation url ' + err);
    throw err;
  }
};
