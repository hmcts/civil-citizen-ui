import {Document} from 'models/document/document';
import {formatStringDateDMY} from 'common/utils/dateUtils';

export class Bundle {
  title: string;
  stitchedDocument?: Document;
  createdOn?: Date;
  bundleHearingDate?: Date;

  constructor(title: string, stitchedDocument?: Document, createdOn?: Date, bundleHearingDate?: Date) {
    this.title = title;
    this.stitchedDocument = stitchedDocument;
    this.createdOn = createdOn ? new Date(createdOn) : null;
    this.bundleHearingDate = bundleHearingDate? new Date(bundleHearingDate) : null;
  }

  get getFormattedCreatedOn(): string {
    if(this.createdOn){
      const createdOnDateFormatted = formatStringDateDMY(this.createdOn);

      return `${createdOnDateFormatted}`;
    }
    return undefined;
  }

  get getFormattedHearingDate(): string {
    if(this.bundleHearingDate){
      return formatStringDateDMY(this.bundleHearingDate);
    }
    return undefined;
  }
}
