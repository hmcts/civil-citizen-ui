import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {SupportRequiredList, SupportRequired} from '../../../common/models/directionsQuestionnaire/supportRequired';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('supportRequiredService');

interface NameListType {
  value: string;
  text: string;
  selected: boolean;
}

export const getSupportRequired = async (claimId: string): Promise<[SupportRequiredList, NameListType[]]> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    // TODO : crteate a generate list method
    const experts = caseData.directionQuestionnaire?.experts?.expertDetailsList?.items?.map(item => {
      const name = `${item.firstName} ${item.lastName}`;
      // TODO : implement selected logic with a separet method
      return {
        value: name,
        text: name,
        selected: false,
      };
    });
    const witnesses = caseData.directionQuestionnaire?.witnesses?.otherWitnesses?.witnessItems?.map(item => {
      const name = `${item.firstName} ${item.lastName}`;
      // TODO : implement selected logic with a separet method
      return {
        value: name,
        text: name,
        selected: false,
      };
    });
    const emptyName = [{
      value: '',
      text: 'Select...',
      selected: false,
    }];

    let nameList = emptyName;
    if (witnesses?.length) {
      nameList = nameList.concat(witnesses);
    }
    if (experts?.length) {
      nameList = nameList.concat(experts);
    }

    console.log('experts--->', experts);
    console.log('witness--->', witnesses);
    return caseData?.directionQuestionnaire?.hearing?.supportRequiredList ?
      [caseData.directionQuestionnaire.hearing?.supportRequiredList, nameList] :
      [new SupportRequiredList([new SupportRequired()]), nameList];
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
