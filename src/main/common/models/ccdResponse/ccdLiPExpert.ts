import {YesNoUpperCamelCase} from 'form/models/yesNo';

export interface CCDLiPExpert {
  expertCanStillExamine?: YesNoUpperCamelCase;
  expertCanStillExamineDetails?: string;
  expertReportRequired? : YesNoUpperCamelCase;
  reportDetails? : CCDReportDetail[];
}

export interface CCDReportDetail {
  id?: string,
  value?: CCDReportDetailsItem,
}

interface CCDReportDetailsItem {
  expertName?: string,
  reportDate?: Date,
}
