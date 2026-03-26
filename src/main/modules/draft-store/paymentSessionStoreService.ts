import {app} from '../../app-instance';

const userIdForPayment = 'userIdForPayment';
const confirmationUrl = 'confirmationUrl';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('paymentSessionStoreService');

const buildUserIdKey = (claimId: string, feeType: string) => claimId + feeType + userIdForPayment;
const buildPaymentConfirmationUrlKey = (claimId: string, feeType: string, userId: string) => claimId + feeType + userId + confirmationUrl;

const buildLegacyUserIdKey = (claimId: string) => claimId + userIdForPayment;
const buildLegacyPaymentConfirmationUrlKey = (userId: string) => userId + userIdForPayment;

export const saveUserId = async (claimId: string, feeType: string, userId: string) => {
  try {
    const existingUserId = await getUserId(claimId, feeType);
    if (existingUserId && existingUserId !== userId) {
      logger.warn(`Overwriting existing userId ${existingUserId} with ${userId} for claimId ${claimId}`);
    }

    await app.locals.draftStoreClient.set(buildUserIdKey(claimId, feeType), userId);
    logger.info('Draft store claim id ' + claimId + ' user id ' + userId);
  } catch (err) {
    logger.error('Error while saving the userid for payment confirmation ' + err);
    throw err;
  }
};

export const getUserId = async (claimId: string, feeType: string): Promise<string> => {
  try {
    let userId =  await app.locals.draftStoreClient.get(buildUserIdKey(claimId, feeType));
    if(!userId){
      //Fallback to OLD key format for backward compatibility
      userId = await app.locals.draftStoreClient.get(buildLegacyUserIdKey(claimId));
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
    await app.locals.draftStoreClient.del(buildUserIdKey(claimId, feeType));
    await app.locals.draftStoreClient.del(buildLegacyUserIdKey(claimId));
  } catch (err) {
    logger.error('Error while deleting the userid for payment confirmation ' + err);
    throw err;
  }
};

export const saveOriginalPaymentConfirmationUrl = async (claimId: string, feeType: string, userId: string, url: string) => {
  try {
    const existingUrl = await getPaymentConfirmationUrl(claimId, feeType, userId);
    if (existingUrl && existingUrl !== url) {
      logger.warn(`Overwriting existing payment confirmation url ${existingUrl} with ${url} for userId ${userId} and claimId ${claimId}`);
    }

    await app.locals.draftStoreClient.set(buildPaymentConfirmationUrlKey(claimId, feeType, userId), url);
  } catch (err) {
    logger.error('Error while saving the original payment confirmation url ' + err);
    throw err;
  }
};

export const getPaymentConfirmationUrl = async (claimId: string | undefined, feeType: string, userId: string): Promise<string> => {
  try {
    let url: string = null;
    if (claimId) {
      url =  await app.locals.draftStoreClient.get(buildPaymentConfirmationUrlKey(claimId, feeType, userId));
    }
    if(!url){
      //Fallback to OLD old key format for backward compatibility
      url =  await app.locals.draftStoreClient.get(buildLegacyPaymentConfirmationUrlKey(userId));
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

export const deletePaymentConfirmationUrl = async (claimId: string | undefined, feeType: string, userId: string): Promise<void> => {
  try {
    if (claimId) {
      await app.locals.draftStoreClient.del(buildPaymentConfirmationUrlKey(claimId, feeType, userId));
    }
    await app.locals.draftStoreClient.del(buildLegacyPaymentConfirmationUrlKey(userId));
  } catch (err) {
    logger.error('Error while deleting the payment confirmation url ' + err);
    throw err;
  }
};
