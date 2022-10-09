import * as express from 'express';

import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {SupportRequiredList, SupportRequired, Support, SupportRequiredParams} from '../../../common/models/directionsQuestionnaire/supportRequired';
import {Claim} from '../../../common/models/claim';
import {ExpertDetails} from '../../../common/models/directionsQuestionnaire/experts/expertDetails';
import {OtherWitnessItems} from '../../../common/models/directionsQuestionnaire/witnesses/otherWitnessItems';
import {YesNo} from '../../../common/form/models/yesNo';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('supportRequiredService');

export interface NameListType {
  value: string;
  text: string;
  selected?: boolean;
}

const generateList = (list: OtherWitnessItems[] | ExpertDetails[]): NameListType[] => {
  return list?.map(item => {
    const name = `${item?.firstName} ${item?.lastName}`;
    const value = (item?.firstName + item?.lastName)?.toLocaleLowerCase();
    return {
      value: value,
      text: name,
    };
  });
};

export const generateExpertAndWitnessList = (caseData: Claim): NameListType[] => {
  const experts = generateList(caseData.directionQuestionnaire?.experts?.expertDetailsList?.items);
  const witnesses = generateList(caseData.directionQuestionnaire?.witnesses?.otherWitnesses?.witnessItems);
  const defaultOption = [{
    value: '',
    text: 'Choose the name of the person',
  }];

  let nameList = defaultOption;
  if (witnesses?.length) {
    nameList = nameList.concat(witnesses);
  }
  if (experts?.length) {
    nameList = nameList.concat(experts);
  }
  return nameList;
};

export const generatePeopleListWithSelectedValues = async (claimId: string, selectedNames: string[]): Promise<NameListType[][]> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    const defaultList = generateExpertAndWitnessList(caseData);
    if (!selectedNames) {
      return [defaultList];
    }
    return selectedNames?.map(selectedName => {
      return defaultList.map(name => {
        return {...name, selected: selectedName?.includes(name.value)};
      });
    });
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getSupportRequired = async (claimId: string): Promise<[SupportRequiredList, NameListType[][]| NameListType[]]> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    const selectedNames = caseData.directionQuestionnaire?.hearing?.supportRequiredList?.items?.map(item => item.fullName);
    const peopleLists = await generatePeopleListWithSelectedValues(claimId, selectedNames);
    return caseData?.directionQuestionnaire?.hearing?.supportRequiredList ?
      [caseData.directionQuestionnaire.hearing?.supportRequiredList, peopleLists] :
      [new SupportRequiredList(undefined, [new SupportRequired()]), peopleLists];
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getSupportRequiredForm = (req: express.Request): SupportRequiredList => {
  if (req.body.option === YesNo.NO) {
    return new SupportRequiredList(req.body.option, [new SupportRequired()]);
  }
  const items = req.body.model.items;
  items.forEach((item: SupportRequiredParams, index: number) => {
    if (item.declared && Array.isArray(item.declared)) {
      item.declared.forEach((supportName: string) => {
        items[index][supportName] = populateSupportForm(items[index][supportName], supportName);
      });
    } else if (item.declared) {
      const supportName = item.declared;
      items[index][supportName] = populateSupportForm(items[index][supportName], supportName);
    }
  });
  return new SupportRequiredList(req.body.option, items.map((item: SupportRequiredParams) => new SupportRequired(item)));
};

function populateSupportForm(value: Support, supportName: string): Support {
  return value ?
    new Support(supportName, true, value.content) :
    new Support(supportName, true);
}
