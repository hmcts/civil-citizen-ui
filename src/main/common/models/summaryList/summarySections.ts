import {SummaryList, SummaryRow} from './summaryList';

export interface SummarySections {
  sections: SummarySection[];
}

export interface SummarySection {
  title: string;
  summaryList: SummaryList;
}

export function summarySection(title: string, classes?: string, ...summaryRows: SummaryRow[]): SummarySection {
  const summaryList = {
    classes: classes,
    rows: summaryRows,
  };

  return {
    title: title,
    summaryList: summaryList,
  };
}

