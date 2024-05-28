import {CuiJudgmentPaidInFull} from 'models/judgmentOnline/cuiJudgmentPaidInFull';
import {Claim} from 'models/claim';

export class JoClaim extends Claim {
  joJudgmentPaidInFull?: CuiJudgmentPaidInFull;
}
