import {app} from '../../app';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimFeeBreakDownController');

export const saveUserId = async (claimId: string, userId: string) => {
  try {
    const draftStoreClient = app.locals.draftStoreClient;
    await draftStoreClient.set(claimId + 'userIdForPayment', userId);
    logger.info('Draft store claim id ' + claimId + ' user id ' + userId);
  } catch (err) {
    logger.info('Error while saving the userid for payment confirmation ' + err);
  }
};
