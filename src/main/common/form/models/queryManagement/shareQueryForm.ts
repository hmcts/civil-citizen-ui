import {IsNotEmpty} from 'class-validator';

export class ShareQueryForm {

  @IsNotEmpty({message: 'PAGES.QM.SHARE_QUERY_CONFIRMATION.CONFIRMATION_ERROR'})
    confirmed?: boolean;

  constructor(confirmed?: boolean) {
    this.confirmed = confirmed;
    }
  }

