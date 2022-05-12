import {SummaryList} from './summaryList';

export interface SummaryListAggregate {
  sections: Section[];
}

export interface Section {
  title: string;
  summaryList: SummaryList;
}
