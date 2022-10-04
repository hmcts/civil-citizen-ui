const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('whyUnavailableForHearingService');

export const getCalculatedDays = async (): Promise<number> => {
  try{
    //TODO: Change the hardcoded 22 to the correct number of days (To be calculated on the page "Are there any dates in
    // the next 12 months when you, your experts or your witnesses cannot attend a hearing?")
    return 22;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

