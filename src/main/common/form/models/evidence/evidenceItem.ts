import {MaxLength} from 'class-validator';
import {FREE_TEXT_MAX_LENGTH} from 'form/validators/validationConstraints';
import {EvidenceType} from 'models/evidence/evidenceType';

export class EvidenceItem {
  type?: EvidenceType;

  @MaxLength(FREE_TEXT_MAX_LENGTH, {message: 'ERRORS.VALID_TEXT_LENGTH'})
    description?: string;

  constructor(type: EvidenceType, description: string) {
    this.type = type;
    this.description = description;
  }
}
