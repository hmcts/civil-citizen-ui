import { Request } from 'express';
import { t } from 'i18next';
import { getCaseDataFromStore } from 'modules/draft-store/draftStoreService';
import {
  Support,
  SupportRequired,
  SupportRequiredList,
  SupportRequiredParams,
} from 'models/directionsQuestionnaire/supportRequired';
import { Claim } from 'models/claim';
import { YesNo } from 'form/models/yesNo';
import { getLng } from 'common/utils/languageToggleUtils';
import { ClaimantResponse } from 'common/models/claimantResponse';
import { PartyType } from 'models/partyType';

const { Logger } = require('@hmcts/nodejs-logging');
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
      const fullName = `${item?.firstName} ${item?.lastName}`;
      return {
        value: fullName,
        text: fullName,
      };
    });
};

export const generateExpertAndWitnessList = (caseData: Claim, lang: string): NameListType[] => {
  if (caseData.isClaimantIntentionPending() && !caseData.claimantResponse) {
    caseData.claimantResponse = new ClaimantResponse();
  }
  const baseProperty = caseData.isClaimantIntentionPending() ? caseData.claimantResponse : caseData;
  const experts = generateList(baseProperty.directionQuestionnaire?.experts?.expertDetailsList?.items?.map(item => ({firstName: item.firstName, lastName: item.lastName})));
  const witnesses = generateList(baseProperty.directionQuestionnaire?.witnesses?.otherWitnesses?.witnessItems?.map(item => ({firstName: item.firstName, lastName: item.lastName})));
  const mySelf = baseProperty.directionQuestionnaire?.confirmYourDetailsEvidence;
  let nameList = [{
    value: '',
    text: t('PAGES.SUPPORT_REQUIRED.CHOOSE_NAME', {lng: getLng(lang)}),
  }];
  if (mySelf) {
    const mySelfItem = [
      {
        value: mySelf.firstName + ' ' + mySelf.lastName,
        text: mySelf.firstName + ' ' + mySelf.lastName,
      },
    ];
    nameList = nameList.concat(mySelfItem);
  } else if (caseData.respondent1?.type === PartyType.INDIVIDUAL && !caseData.isClaimantIntentionPending()) {
    const mySelfItem = [
      {
        value: caseData.respondent1.partyDetails?.individualFirstName + ' ' + caseData.respondent1.partyDetails?.individualLastName,
        text: caseData.respondent1.partyDetails?.individualFirstName + ' ' + caseData.respondent1.partyDetails?.individualLastName,
      },
    ];
    nameList = nameList.concat(mySelfItem);
  }
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
        return {...name, selected: selectedName?.replace(/ /g, '') === name.value.replace(/ /g, '')};
      });
    });
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getSupportRequired = async (claimId: string): Promise<SupportRequiredList> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    if (caseData.isClaimantIntentionPending() && caseData.claimantResponse?.directionQuestionnaire?.hearing?.supportRequiredList) {
      return caseData.claimantResponse.directionQuestionnaire.hearing.supportRequiredList;
    } else if (!caseData.isClaimantIntentionPending() && caseData.directionQuestionnaire?.hearing?.supportRequiredList) {
      return caseData.directionQuestionnaire.hearing.supportRequiredList;
    }
    return new SupportRequiredList(undefined, [new SupportRequired()]);
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
