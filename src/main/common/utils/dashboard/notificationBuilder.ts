import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {Notifications} from './notifications';

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
  build(): Notifications  {
    return new Notifications(this._title, this._content);
  }
}
