import {Claim} from 'models/claim';
import * as urls from 'routes/urls';
import {getNumberOfDaysBetweenTwoDays} from 'common/utils/dateUtils';

export const replaceValues = (textToReplace: string, claim: Claim): string => {

  const valuesMap = setValues(claim);
  valuesMap.forEach((value: string, key: string) => {
    textToReplace = textToReplace.replace(key, value);
  });

  return textToReplace;
};

const setValues = (claim: Claim): Map<string, string> => {
  const valuesMap: Map<string, string> = new Map<string, string>();

  const daysToRespond = claim.respondent1ResponseDeadline ? getNumberOfDaysBetweenTwoDays(new Date(), claim.respondent1ResponseDeadline).toString()  :'';

  valuesMap.set('{BASE_ELIGIBILITY_URL}', urls.BASE_ELIGIBILITY_URL.toString());
  valuesMap.set('{VIEW_CLAIM_URL}', '');
  valuesMap.set('{VIEW_INFO_ABOUT_CLAIMANT}', '');
  valuesMap.set('{VIEW_RESPONSE_TO_CLAIM}', '');
  valuesMap.set('{VIEW_INFO_ABOUT_DEFENDANT}', '');
  valuesMap.set('{VIEW_HEARINGS}', '');
  valuesMap.set('{UPLOAD_HEARING_DOCUMENTS}', '');
  valuesMap.set('{ADD_TRIAL_ARRANGEMENTS}', '');
  valuesMap.set('{VIEW_BUNDLE}', '');
  valuesMap.set('{VIEW_ORDERS_AND_NOTICES}', '');
  valuesMap.set('{VIEW_JUDGEMENT}', '');
  valuesMap.set('{VIEW_APPLICATIONS}', '');

  valuesMap.set('{daysToRespond}', daysToRespond);

  return valuesMap;
};
