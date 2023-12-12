import {YesNo, YesNoNotReceived} from 'form/models/yesNo';
import {t} from 'i18next';

export const getEmptyStringIfUndefined = (value: string): string => value || '';

export const getEmptyStringIfUndefinedForNumber = (value: number): string => value.toString() || '';

export const getFormattedAnswerForYesNoNotReceived = (value:string, lng: string): string => {
  switch (value) {
    case YesNo.YES:
      return t('COMMON.YES', {lng});
    case YesNo.NO:
      return t('COMMON.NO', {lng});
    case YesNoNotReceived.NOT_RECEIVED:
      return t('PAGES.SENT_EXPERT_REPORTS.OPTION_NOT_RECEIVED', {lng});
    default:
      return '';
  }
};
