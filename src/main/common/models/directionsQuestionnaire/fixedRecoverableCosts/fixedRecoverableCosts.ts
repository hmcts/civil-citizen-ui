import {GenericYesNo} from 'form/models/genericYesNo';

export class FixedRecoverableCosts {
  subjectToFrc: GenericYesNo;
  frcBandAgreed?: GenericYesNo;
  complexityBand?: string;
  reasonsForBandSelection?: string;
  reasonsForNotSubjectToFrc?: string;
}
