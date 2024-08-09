import {Experts} from 'models/directionsQuestionnaire/experts/experts';
import {toCCDYesNo, toCCDYesNoFromBoolean} from 'services/translation/response/convertToCCDYesNo';
import {YesNo} from 'form/models/yesNo';

export const toCCDLiPExpert = (expert: Experts | undefined) => {
  return {
    caseNeedsAnExpert: toCCDYesNoFromBoolean(expert?.expertRequired),
    expertCanStillExamineDetails: expert?.expertCanStillExamine?.option == YesNo.YES ? expert?.expertCanStillExamine?.details : '',
    expertReportRequired: toCCDYesNo(expert?.expertReportDetails?.option),
  };
};
