import {ClaimSummaryContent} from 'form/models/claimSummarySection';

export class TabItem {
  label: string;
  id: string;
  panels: ClaimSummaryContent[];

  constructor(label: string, id: string, panels?: ClaimSummaryContent[]) {
    this.label = label;
    this.id = id;
    this.panels = panels;
  }
}

