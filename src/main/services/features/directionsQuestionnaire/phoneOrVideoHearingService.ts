import {getCaseDataFromStore, saveDraftClaim} from '../../../modules/draft-store/draftStoreService';
import {YesNo} from '../../../common/form/models/yesNo';
import {PhoneOrVideoHearing} from '../../../common/models/directionsQuestionnaire/hearing/phoneOrVideoHearing';
import {DirectionQuestionnaire} from '../../../common/models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from '../../../common/models/directionsQuestionnaire/hearing/hearing';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('PhoneOrVideoHearing');

export const getphoneOrVideoHearing = async (claimId: string): Promise<PhoneOrVideoHearing> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    return caseData.directionQuestionnaire?.hearing?.phoneOrVideoHearing ? caseData.directionQuestionnaire.hearing.phoneOrVideoHearing : new PhoneOrVideoHearing();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getphoneOrVideoHearingForm = (option: YesNo, details: string): PhoneOrVideoHearing => {
  const phoneOrVideoHearing = (option === YesNo.NO) ? '' : details;
  return (option) ?
    new PhoneOrVideoHearing(option, phoneOrVideoHearing) :
    new PhoneOrVideoHearing();
};

export const savephoneOrVideoHearing = async (claimId: string, phoneOrVideoHearing: PhoneOrVideoHearing) => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    if (caseData?.directionQuestionnaire?.hearing) {
      caseData.directionQuestionnaire.hearing = {...caseData.directionQuestionnaire.hearing, phoneOrVideoHearing};
    } else {
      caseData.directionQuestionnaire = new DirectionQuestionnaire();
      caseData.directionQuestionnaire.hearing = new Hearing();
      caseData.directionQuestionnaire.hearing.phoneOrVideoHearing = phoneOrVideoHearing;
    }
    await saveDraftClaim(claimId, caseData);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
