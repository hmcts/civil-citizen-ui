import {Request} from 'express';
import {t} from 'i18next';

import {getCaseDataFromStore} from '../../../modules/draft-store/draftStoreService';
import {SupportRequiredList, SupportRequired, Support, SupportRequiredParams} from '../../../common/models/directionsQuestionnaire/supportRequired';
import {Claim} from '../../../common/models/claim';
import {YesNo} from '../../../common/form/models/yesNo';
import {getLng} from '../../../common/utils/languageToggleUtils';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('supportRequiredService');

export interface NameListType {
  value: string;
  text: string;
  selected?: boolean;
}

export interface FullName {
  firstName: string;
  lastName: string;
}

const generateList = (list: FullName[]): NameListType[] => {
  return list?.filter((item: FullName)=> item.firstName || item.lastName)
    .map((item: FullName) => {
      const name = `${item?.firstName} ${item?.lastName}`;
      const value = (item?.firstName + item?.lastName)?.toLocaleLowerCase();
      return {
        value: value,
        text: name,
      };
    });
};

export const generateExpertAndWitnessList = (caseData: Claim, lang: string): NameListType[] => {
  const experts = generateList(caseData.directionQuestionnaire?.experts?.expertDetailsList?.items?.map(item => ({firstName: item.firstName, lastName: item.lastName})));
  const witnesses = generateList(caseData.directionQuestionnaire?.witnesses?.otherWitnesses?.witnessItems?.map(item => ({firstName: item.firstName, lastName: item.lastName})));
  const defaultOption = [{
    value: '',
    text: t('PAGES.SUPPORT_REQUIRED.CHOOSE_NAME', {lng: getLng(lang)}),
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

export const generatePeopleListWithSelectedValues = async (claimId: string, selectedNames: string[], lang: string): Promise<NameListType[][]> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    const defaultList = generateExpertAndWitnessList(caseData, lang);
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

export const getSupportRequired = async (claimId: string, lang: string): Promise<[SupportRequiredList, NameListType[][]| NameListType[]]> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    const selectedNames = caseData.directionQuestionnaire?.hearing?.supportRequiredList?.items?.map(item => item.fullName);
    const peopleLists = await generatePeopleListWithSelectedValues(claimId, selectedNames, lang);
    return caseData?.directionQuestionnaire?.hearing?.supportRequiredList ?
      [caseData.directionQuestionnaire.hearing?.supportRequiredList, peopleLists] :
      [new SupportRequiredList(undefined, [new SupportRequired()]), peopleLists];
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getSupportRequiredForm = (req: Request): SupportRequiredList => {
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
