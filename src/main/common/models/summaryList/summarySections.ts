import {SummaryList, SummaryRow} from './summaryList';

export interface SummarySections {
  sections: SummarySection[];
}

export interface SummarySection {
  title: string;
  summaryList: SummaryList;
}

export interface SummarySectionParams {
  title: string;
  classes?: string;
  summaryRows: SummaryRow[];
}

export function summarySection(summarySectionParams: SummarySectionParams): SummarySection {
  const summaryList = {
    ...(summarySectionParams.classes) && {classes: summarySectionParams.classes},
    rows: summarySectionParams.summaryRows,
  };

  return {
    title: summarySectionParams.title,
    summaryList: summaryList,
  };
}

