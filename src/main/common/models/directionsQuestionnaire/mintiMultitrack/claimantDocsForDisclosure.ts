import {IsNotEmpty} from 'class-validator';
import {YesNo} from 'form/models/yesNo';

export class ClaimantDocsForDisclosure {

  title = 'PAGES.DISCLOSURE_NON_ELECTRONIC_DOCUMENTS.TEXT_AREA.LABEL';
  hint = 'PAGES.DISCLOSURE_NON_ELECTRONIC_DOCUMENTS.TEXT_AREA.HINT';

  @IsNotEmpty({message: 'ERRORS.DISCLOSURE_NON_ELECTRONIC_DOCUMENTS'})
    option?: YesNo;

  constructor(option?: YesNo) {
    this.option = option;
  }
}
