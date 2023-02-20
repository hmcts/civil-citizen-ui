import {YesNo, YesNoNotReceived, YesNoUpperCase} from "form/models/yesNo";
import {t} from "i18next";

export const getEmptyStringIfUndefined = (value: string): string => value || '';

export const affirmation = (value:string, lng: string)=> {

  return {
    affirming() {
      if (value === YesNo.YES)
        return YesNoUpperCase.YES;

      if (value === YesNo.NO)
        return YesNoUpperCase.NO;

      return (value === YesNoNotReceived.NOT_RECEIVED) ? YesNoNotReceived.NOT_RECEIVED : "";
    },

    get() {
      switch (value) {
        case YesNo.YES:
          return t(`COMMON.${YesNo.YES}`, lng);
        case YesNo.NO:
          return t(`COMMON.${YesNo.NO}`, lng);
        case YesNoNotReceived.NOT_RECEIVED:
          return t("PAGES.SENT_EXPERT_REPORTS.OPTION_NOT_RECEIVED", lng);
        default:
          return value ?? "";
      }
    }
  }
}