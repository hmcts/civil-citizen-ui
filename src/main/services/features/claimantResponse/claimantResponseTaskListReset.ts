import {Claim} from 'models/claim';
import {ClaimantResponse} from 'models/claimantResponse';

export type ClaimantResponseField = keyof ClaimantResponse;

export type TaskListResetContext = {
  claim: Claim;
  propertyName: string;
  parentPropertyName?: string;
};

export type TaskListResetEffect = (claim: Claim) => void;

export type TaskListResetRule = {
  id: string;
  when: (context: TaskListResetContext) => boolean;
  apply: TaskListResetEffect;
  /** When true, matching this rule does not stop evaluation of later rules. */
  continue?: boolean;
};

const SUGGESTED_PAYMENT_INTENTION_CHILD_PROPERTIES = ['paymentOption', 'paymentDate', 'repaymentPlan'] as const;

export function deleteClaimantResponseFields(claim: Claim, fields: readonly ClaimantResponseField[]): void {
  const claimantResponse = claim.claimantResponse;
  if (!claimantResponse) {
    return;
  }

  for (const field of fields) {
    delete claimantResponse[field];
  }
}

export function clearMediationCarm(claim: Claim): void {
  deleteClaimantResponseFields(claim, ['mediationCarm']);
}

export function clearFormaliseRepaymentData(claim: Claim): void {
  deleteClaimantResponseFields(claim, ['ccjRequest', 'signSettlementAgreement']);
}

export function clearTaskListData(claim: Claim): void {
  deleteClaimantResponseFields(claim, [
    'suggestedPaymentIntention',
    'courtProposedDate',
    'rejectionReason',
    'chooseHowToProceed',
    'signSettlementAgreement',
    'ccjRequest',
    'courtDecision',
  ]);
}

export function clearAcceptOrRejectAmountData(claim: Claim): void {
  deleteClaimantResponseFields(claim, [
    'hasPartPaymentBeenAccepted',
    'mediation',
    'directionQuestionnaire',
    'fullAdmitSetDateAcceptPayment',
  ]);
  clearTaskListData(claim);
}

export function clearProposeAlternativeRepaymentPlanData(claim: Claim): void {
  deleteClaimantResponseFields(claim, ['chooseHowToProceed']);
  clearFormaliseRepaymentData(claim);
}

export function clearMediationAndDirectionQuestionnaire(claim: Claim): void {
  deleteClaimantResponseFields(claim, ['mediation', 'directionQuestionnaire']);
}

function isAcceptOrRejectTheAmountSubmitted(propertyName: string): boolean {
  return propertyName === 'hasPartAdmittedBeenAccepted';
}

function isAcceptOrRejectRepaymentPlanSubmitted(propertyName: string): boolean {
  return propertyName === 'fullAdmitSetDateAcceptPayment';
}

function isProposeAnAlternativeRepaymentPlanSubmitted(propertyName: string, parentPropertyName?: string): boolean {
  return (parentPropertyName === 'suggestedPaymentIntention' && SUGGESTED_PAYMENT_INTENTION_CHILD_PROPERTIES.includes(propertyName as typeof SUGGESTED_PAYMENT_INTENTION_CHILD_PROPERTIES[number]))
    || (parentPropertyName === 'courtProposedDate' && propertyName === 'decision')
    || propertyName === 'courtDecision';
}

function isChooseHowToProceedSubmitted(propertyName: string, parentPropertyName?: string): boolean {
  return propertyName === 'option' && parentPropertyName === 'chooseHowToProceed';
}

function isFullDefenceDisputeNoProceed(claim: Claim, parentPropertyName?: string): boolean {
  return claim.isFullDefence()
    && claim.isRejectAllOfClaimDispute()
    && parentPropertyName === 'intentionToProceed';
}

function isFullDefencePaidAgreed(claim: Claim, propertyName: string): boolean {
  return claim.isFullDefence()
    && claim.hasConfirmedAlreadyPaid()
    && propertyName === 'hasFullDefenceStatesPaidClaimSettled';
}

/**
 * Explicit reset rules for claimant response task-list data.
 * Rules without `continue` are mutually exclusive (first match wins).
 * The mediationCarm rule always runs independently.
 */
export const CLAIMANT_RESPONSE_TASK_LIST_RESET_RULES: readonly TaskListResetRule[] = [
  {
    id: 'clearMediationCarmWhenSettled',
    when: ({claim}) => !claim.hasClaimantNotSettled(),
    apply: clearMediationCarm,
    continue: true,
  },
  {
    id: 'acceptOrRejectTheAmount',
    when: ({propertyName}) => isAcceptOrRejectTheAmountSubmitted(propertyName),
    apply: clearAcceptOrRejectAmountData,
  },
  {
    id: 'acceptOrRejectRepaymentPlan',
    when: ({propertyName}) => isAcceptOrRejectRepaymentPlanSubmitted(propertyName),
    apply: clearTaskListData,
  },
  {
    id: 'proposeAlternativeRepaymentPlan',
    when: ({propertyName, parentPropertyName}) =>
      isProposeAnAlternativeRepaymentPlanSubmitted(propertyName, parentPropertyName),
    apply: clearProposeAlternativeRepaymentPlanData,
  },
  {
    id: 'chooseHowToProceed',
    when: ({propertyName, parentPropertyName}) =>
      isChooseHowToProceedSubmitted(propertyName, parentPropertyName),
    apply: clearFormaliseRepaymentData,
  },
  {
    id: 'fullDefenceDisputeOrPaidAgreed',
    when: ({claim, propertyName, parentPropertyName}) =>
      isFullDefenceDisputeNoProceed(claim, parentPropertyName)
      || isFullDefencePaidAgreed(claim, propertyName),
    apply: clearMediationAndDirectionQuestionnaire,
  },
];

export function applyTaskListResetRules(
  claim: Claim,
  propertyName: string,
  parentPropertyName?: string,
  rules: readonly TaskListResetRule[] = CLAIMANT_RESPONSE_TASK_LIST_RESET_RULES,
): Claim {
  const context: TaskListResetContext = {claim, propertyName, parentPropertyName};

  for (const rule of rules) {
    if (!rule.when(context)) {
      continue;
    }

    rule.apply(claim);

    if (!rule.continue) {
      break;
    }
  }

  return claim;
}
