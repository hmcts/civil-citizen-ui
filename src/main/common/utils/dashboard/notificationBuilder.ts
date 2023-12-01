import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {Notification} from './notification';

export class NotificationBuilder {
  _content: ClaimSummarySection[] = [];
  _title: string;
  addTitle(title: string): this {
    this._title = title;
    return this;
  }

  addContent(items: ClaimSummarySection[]) {
    this._content.push(...items);
    return this;
  }
  build(): Notification  {
    return new Notification(this._title, this._content);
  }
}
