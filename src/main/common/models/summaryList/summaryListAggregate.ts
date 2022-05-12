import {SummaryList} from './summaryList';

export class SummaryListAggregate {
  sections: Section[];
}

export class Section {
  title: string;
  summaryList: SummaryList;
}
