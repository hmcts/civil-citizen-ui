import {DebtRespiteOption} from './breathingSpace/debtRespiteOption';
import {DebtRespiteReferenceNumber} from './breathingSpace/debtRespiteReferenceNumber';
import {DebtRespiteStartDate} from './breathingSpace/debtRespiteStartDate';
import {DebtRespiteEndDate} from './breathingSpace/debtRespiteEndDate';

export class BreathingSpace {
  debtRespiteOption?: DebtRespiteOption;
  debtRespiteReferenceNumber?: DebtRespiteReferenceNumber;
  debtRespiteStartDate?: DebtRespiteStartDate;
  debtRespiteEndDate?: DebtRespiteEndDate;
  debtRespiteLiftDate?: DebtRespiteStartDate;
}
