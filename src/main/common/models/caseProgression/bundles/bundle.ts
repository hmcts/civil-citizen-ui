import {Document} from 'models/document/document';

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
}
