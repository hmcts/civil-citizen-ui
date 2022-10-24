import {MaxLength, ValidateNested} from 'class-validator';
import { VALID_TEXT_LENGTH } from '../../../../common/form/validationErrors/errorMessageConstants';
import { FREE_TEXT_MAX_LENGTH } from '../../../../common/form/validators/validationConstraints';
import { ClaimDetails } from '../claim/details/claimDetails';
import { EvidenceItem } from './evidenceItem';

export const INIT_ROW_COUNT = 4;

export class Evidence {
  @MaxLength(FREE_TEXT_MAX_LENGTH, { message: VALID_TEXT_LENGTH })
    comment?: string;

  @ValidateNested()
    evidenceItem?: EvidenceItem[] ;

  constructor(comment?: string, evidenceItem?: EvidenceItem[]) {
    this.comment = comment;
    this.evidenceItem = evidenceItem || this.getInitialRows();
  }

  getInitialRows() : EvidenceItem[] {
    const items: EvidenceItem[] = [];
    for (let i = 0; i < INIT_ROW_COUNT; i++) {
      items.push(new EvidenceItem(null,''));
    }
    return items;
  }

  setRows(countRow?:number) {
    for (let i = 0; i < countRow; i++) {
      this.evidenceItem.push(new EvidenceItem(null,''));
    }
  }

  static buildForm(claimDetails: ClaimDetails) {
    if (claimDetails.evidence) {
      claimDetails.evidence = new Evidence(claimDetails.evidence.comment,claimDetails.evidence.evidenceItem);
      if (claimDetails.evidence.evidenceItem.length < INIT_ROW_COUNT) {
        claimDetails.evidence.setRows(INIT_ROW_COUNT - claimDetails.evidence.evidenceItem.length);
      }
    } else {
      claimDetails.evidence = new Evidence();
    }
  }
}
