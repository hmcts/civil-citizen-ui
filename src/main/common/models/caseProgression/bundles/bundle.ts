import {Document} from 'models/document/document';
import {YesNo} from 'form/models/yesNo';

export class Bundle {
  id: string;
  title: string;
  description: string;
  stitchStatus?: string;
  stitchedDocument?: Document;
  filename: string;
  createdOn?: Date;

  hasCoversheets: YesNo;
  hasTableOfContents: YesNo;

  bundleHearingDate?: Date;
  stitchingFailureMessage?: string;
}
