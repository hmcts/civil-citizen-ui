import {YesNoUpperCamelCase} from 'form/models/yesNo';

export interface CCDLiPExpert {
  caseNeedsAnExpert?: YesNoUpperCamelCase;
  expertCanStillExamineDetails?: string;
  expertReportRequired? : YesNoUpperCamelCase;
  details? : CCDReportDetail[];
}

export interface CCDReportDetail {
  id?: string,
  value?: CCDReportDetailsItem,
}

interface CCDReportDetailsItem {
  expertName?: string,
  reportDate?: Date,
}
