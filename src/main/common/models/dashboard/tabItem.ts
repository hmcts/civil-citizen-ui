import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {t} from 'i18next';

export class TabItem {
  label: string;
  id: string;
  panels: ClaimSummaryContent[];

  constructor(label: string, id: string, panels?: ClaimSummaryContent[]) {
    this.label = t(label);
    this.id = id;
    this.panels = panels;
  }
}

