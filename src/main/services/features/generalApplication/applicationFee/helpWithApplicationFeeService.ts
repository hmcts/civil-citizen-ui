import {AppRequest} from 'models/AppRequest';
import {YesNo} from 'form/models/yesNo';
import {GA_APPLY_HELP_WITH_FEES} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('applicationFeeHelpSelectionService');
export const getRedirectUrl = async (claimId: string, applyHelpWithFees: YesNo, req: AppRequest): Promise<string> => {
  try{
    let redirectUrl;
    if (applyHelpWithFees === YesNo.NO) {
      redirectUrl = 'test'; // TODO: add url
    } else {
      redirectUrl = constructResponseUrlWithIdParams(claimId, GA_APPLY_HELP_WITH_FEES);
    }
    return redirectUrl;
  }
  catch (error) {
    logger.error(error);
    throw error;
  }
};
