import {Claim} from 'common/models/claim';
import {converToSummaryCard, summaryRow} from 'common/models/summaryList/summaryList';
import {
  CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL,
  CLAIMANT_RESPONSE_INTENTION_TO_PROCEED_URL,
  CLAIMANT_RESPONSE_REJECTION_REASON_URL,
  CLAIMANT_RESPONSE_SETTLE_CLAIM_URL,
} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {ChooseHowProceed} from 'common/models/chooseHowProceed';
import {YesNo} from 'common/form/models/yesNo';
/*--------------------------------------------------------
NOTE: This is only a concept code not real implemantation
Implemantation of this logic wil be subject to another task
---------------------------------------------------------*/
export const firstSection = [
  {
    type: 'header',
    title: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.PAGE_TITLE',
  },
  {
    type: 'single-row',
    title: {
      text: 'PAGES.SETTLE_CLAIM_PART_PAYMENT_RECEIVED.TITLE',
      variables: {
        paidAmount: 500,
        name: 'John Doe',
      },
    },
    displayValue: {
      path: 'claimantResponse/hasPartPaymentBeenAccepted/option',
      converter: convertYesNoToDisplay,
    },
    href: CLAIMANT_RESPONSE_SETTLE_CLAIM_URL,
  },
  {
    type: 'single-row',
    title: 'PAGES.CLAIMANT_REPAYMNET_PLAN_REJECT_REASON.TITLE',
    displayValue: {
      path: 'claimantResponse/rejectionReason/text',
    },
    href: CLAIMANT_RESPONSE_REJECTION_REASON_URL,
  },
];

export const secondSection = [
  {
    type: 'header',
    title: 'PAGES.CLAIMANT_RESPONSE_PROCEED.TITLE',
  },
  {
    type: 'single-row',
    title: 'PAGES.CLAIMANT_RESPONSE_PROCEED.TITLE',
    displayValue: {
      path: 'claimantResponse/intentionToProceed/option',
      converter: convertYesNoToDisplay,
    },
    href: CLAIMANT_RESPONSE_INTENTION_TO_PROCEED_URL,
  },
  {
    type: 'single-row',
    title: 'PAGES.CLAIMANT_FORMALISE_REPAYMENT_TYPE.TITLE',
    displayValue: {
      path: 'claimantResponse/chooseHowToProceed/option',
      converter: convertHowToProccedValueToDisplay,
    },
    href: CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL,
  },
];

export const checkYourAnswersList = [
  ...firstSection,
  ...secondSection,
];

export function generateSummaryLists(claim: Claim, fieldList: any[], claimId?: string) {
  if (claim && fieldList?.length) {
    let isSection = false;
    let sectionCounter = -1;
    const summaryLists: any[] = [];
    fieldList.forEach((item) => {
      if (item.type === 'header') {
        isSection = true;
        sectionCounter = sectionCounter + 1;
      } else {
        isSection = false;
      }
      if (isSection) {
        summaryLists[sectionCounter] = {card: {}, rows: [] as any[]};
        summaryLists[sectionCounter].card = converToSummaryCard(item.title);
        summaryLists[sectionCounter].rows = [];
      } else {
        const feildValue = getFieldValueWithPath(claim, item.displayValue.path);
        if (feildValue) {
          const fieldDisplayValue = item.displayValue?.converter ? item.displayValue?.converter(feildValue) : feildValue;
          const url = claimId ? constructResponseUrlWithIdParams(claimId, item.href) : item.href;
          summaryLists[sectionCounter].rows.push(summaryRow(item.title, fieldDisplayValue, url, 'Change'));
        }
      }
    });
    return summaryLists;
  }
}

function getFieldValueWithPath(input: any, path: string) {
  return path.split('/').reduce((output, curr) => {
    if (output && typeof output === 'object') {
      return output[curr];
    }
  }, input);
}

export function convertHowToProccedValueToDisplay(value: ChooseHowProceed): string {
  if (value === ChooseHowProceed.SIGN_A_SETTLEMENT_AGREEMENT) {
    return 'PAGES.CLAIMANT_FORMALISE_REPAYMENT_TYPE.SIGN_A_SETTLEMENT_AGREEMENT.LABEL';
  } else if (value === ChooseHowProceed.REQUEST_A_CCJ) {
    return 'PAGES.CLAIMANT_FORMALISE_REPAYMENT_TYPE.REQUEST_A_CCJ.LABEL';

  }
}

export function convertYesNoToDisplay(value: YesNo): string {
  if (value === YesNo.YES) {
    return 'COMMON.YES';
  } else if (value === YesNo.NO) {
    return 'COMMON.NO';
  }
}
