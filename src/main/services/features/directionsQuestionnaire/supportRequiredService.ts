import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {SupportRequiredList, SupportRequired} from '../../../common/models/directionsQuestionnaire/supportRequired';
import {Claim} from '../../../common/models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('supportRequiredService');

interface NameListType {
  value: string;
  text: string;
  selected: boolean;
}
export const generatePersonList = (caseData: Claim): NameListType[] => {
  // TODO : update for no provided names --> no selected names so we should directly return experts and witness list unselected
  // first create list after if provided list exisitng update the selected value with it
  const experts = caseData.directionQuestionnaire?.experts?.expertDetailsList?.items?.map(item => {
    const name = `${item.firstName} ${item.lastName}`;
    const value = (item.firstName+item.lastName).toLocaleLowerCase();
    // TODO : implement selected logic with a separet method
    return {
      value: value,
      text: name,
      selected: false,
    };
  });
  const witnesses = caseData.directionQuestionnaire?.witnesses?.otherWitnesses?.witnessItems?.map(item => {
    const name = `${item.firstName} ${item.lastName}`;
    const value = (item.firstName + item.lastName).toLocaleLowerCase();
    // TODO : implement selected logic with a separet method
    return {
      value: value,
      text: name,
      selected: false,
    };
  });
  const emptyName = [{
    value: '',
    text: 'Choose the name of the person',
    selected: false,
  }];

  let nameList = emptyName;
  if (witnesses?.length) {
    nameList = nameList.concat(witnesses);
  }
  if (experts?.length) {
    nameList = nameList.concat(experts);
  }
  return nameList;
};

export const generatePersonListWithSelected = (defaultList: NameListType[], providedNames: string[]): NameListType[][] => {
  // TODO : update for no provided names --> no selected names so we should directly return experts and witness list unselected
  // first create list after if provided list exisitng update the selected value with it
  return providedNames?.map(pName => {
    return defaultList.map(row => {
      return {...row, selected: pName.includes(row.value)};
    });
  });
};


export const getSupportRequired = async (claimId: string): Promise<[SupportRequiredList, NameListType[][]| NameListType[]]> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    const providedNames = caseData.directionQuestionnaire?.hearing?.supportRequiredList?.items?.map(item => item.name.toLocaleLowerCase());
    console.log('saved-names->', providedNames);
    // TODO : crteate a generate list method

    const defaultList = generatePersonList(caseData);
      //  TODO : move this logic inside generatePersonListWithSelected
    const nameLists = providedNames ? generatePersonListWithSelected(defaultList, providedNames) : [defaultList];



    // console.log('experts--->', experts);
    // console.log('witness--->', witnesses);
    return caseData?.directionQuestionnaire?.hearing?.supportRequiredList ?
      [caseData.directionQuestionnaire.hearing?.supportRequiredList, nameLists] :
      [new SupportRequiredList(undefined, [new SupportRequired()]), nameLists];
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
