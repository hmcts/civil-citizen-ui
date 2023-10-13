
import { YesNo, YesNoUpperCase } from 'common/form/models/yesNo';
import { ChooseHowProceed } from 'common/models/chooseHowProceed';


export const RESPONSEFORNOTPAIDPAYIMMEDIATELY = {
  [YesNo.YES]: 'PAGES.CHECK_YOUR_ANSWER.I_ACCEPT_THIS_AMOUNT',
  [YesNo.NO]: 'PAGES.CHECK_YOUR_ANSWER.I_REJECT_THIS_AMOUNT',
};

export const RESPONSEFORDEFENDANTREPAYMENTPLAN = {
  [YesNo.YES]: 'PAGES.CHECK_YOUR_ANSWER.I_ACCEPT_THIS_REPAYMENT_PLAN',
  [YesNo.NO]: 'PAGES.CHECK_YOUR_ANSWER.I_REJECT_THIS_REPAYMENT_PLAN',
};

export const RESPONSFORCYAFORCHOOSEHOWTOPROCEED = {
  [ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT]: 'PAGES.CHECK_YOUR_ANSWER.SIGN_A_SETTLEMENT_AGREEMENT',
  [ChooseHowProceed.REQUEST_A_CCJ]: 'PAGES.CHECK_YOUR_ANSWER.ISSUE_A_CCJ',
};