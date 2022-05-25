import {MaxLength} from 'class-validator'; // IsIn, IsDefined, ValidateIf,
import {
  VALID_TEXT_LENGTH,
} from '../../../../common/form/validationErrors/errorMessageConstants';
import { FREE_TEXT_MAX_LENGTH } from '../../../../common/form/validators/validationConstraints';
import { EvidenceType } from '../../../models/evidence/evidenceType';

export class EvidenceItem {

  type?: EvidenceType;

  @MaxLength(FREE_TEXT_MAX_LENGTH, { message: VALID_TEXT_LENGTH })
    description?: string;

  constructor(type: EvidenceType, description: string) {
    this.type = type;
    this.description = description;
  }
}
