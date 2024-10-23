import {app} from '../../app';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimFeeBreakDownController');

export const saveUserId = async (claimId: string, userId: string) => {
  const draftStoreClient = app.locals.draftStoreClient;
  await draftStoreClient.set(claimId + 'userIdForPayment', userId);
  logger.info('Draft store claim id ' + claimId + ' user id ' + userId);
};

export const saveOriginalPaymentConfirmationUrl = async (userId: string, originalUrl: string) => {
  await app.locals.draftStoreClient.set(userId + 'userIdForPayment', originalUrl);
};

export const getUserId = async (claimId: string): Promise<string> => {
  return await app.locals.draftStoreClient.get(claimId + 'userIdForPayment');
};

export const getPaymentConfirmationUrl = async (userId: string): Promise<string> => {
  return await app.locals.draftStoreClient.get(userId + 'userIdForPayment');
};

