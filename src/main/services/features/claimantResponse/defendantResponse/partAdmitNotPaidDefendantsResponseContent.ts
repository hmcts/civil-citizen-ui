import {Claim} from '../../../../common/models/claim';
import {ClaimSummarySection, ClaimSummaryType} from '../../../../common/form/models/claimSummarySection';
import {ClaimResponseStatus} from 'models/claimResponseStatus';
import {
  getDisagreementStatementWithEvidence,
  getDisagreementStatementWithTimeline,
  getTheirEvidence,
  getTheirTOEs,
} from './fullDisputeDefendantsResponseContent';
import {formatDateToFullDate} from '../../../../common/utils/dateUtils';

const getResponseStatement = (claim: Claim, lang: string) => {
  switch(claim.responseStatus) {
    case ClaimResponseStatus.PA_NOT_PAID_PAY_INSTALLMENTS:
      return getResponseStatementPayInstallments(claim);

    case ClaimResponseStatus.PA_NOT_PAID_PAY_IMMEDIATELY:
      return getResponseStatementPayImmediately(claim);

    case ClaimResponseStatus.PA_NOT_PAID_PAY_BY_DATE:
      return getResponseStatementPayByDate(claim, lang);
  }
};

const getResponseStatementPayInstallments = (claim: Claim): ClaimSummarySection[] => {
  return [{
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_NOT_PAID.DEFENDANT_ADMITS_THEY_OWE',
      variables: {defendant: claim.getDefendantFullName(), paidAmount: claim.partialAdmission.howMuchDoYouOwe.amount},
    }},
  {
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_NOT_PAID.THEY_OFFERED_TO_PAY_YOU',
      variables: {paidAmount: claim.partialAdmission.howMuchDoYouOwe.amount},
    },
  }];
};

const getResponseStatementPayImmediately = (claim: Claim): ClaimSummarySection[] => {
  return [{
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_NOT_PAID.DEFENDANT_ADMITS_THEY_OWE',
      variables: {defendant: claim.getDefendantFullName(), paidAmount: claim.partialAdmission.howMuchDoYouOwe.amount},
    }},
  {
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_NOT_PAID.THEY_OFFERED_TO_PAY_YOU_IMMEDIATELY',
      variables: {paidAmount: claim.partialAdmission.howMuchDoYouOwe.amount},
    },
  }];
};

const getResponseStatementPayByDate = (claim: Claim, lang: string): ClaimSummarySection[] => {
  return [{
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_NOT_PAID.DEFENDANT_ADMITS_THEY_OWE',
      variables: {defendant: claim.getDefendantFullName(), paidAmount: claim.partialAdmission.howMuchDoYouOwe.amount},
    }},
  {
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_NOT_PAID.THEY_OFFERED_TO_PAY_YOU_BY_DATE',
      variables: {paidAmount: claim.partialAdmission.howMuchDoYouOwe.amount, datePaid: formatDateToFullDate(claim.partialAdmission.paymentIntention.paymentDate, lang)},
    },
  }];
};

export const getTheirDefence = (text: string): ClaimSummarySection[] => {
  return [{
    type: ClaimSummaryType.TITLE,
    data: {
      text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.THEIR_DEFENCE',
    },
  },
  {
    type: ClaimSummaryType.SUBTITLE,
    data: {
      text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_NOT_PAID.WHY_THEY_DONT_OWE',
    },
  },
  {
    type: ClaimSummaryType.PARAGRAPH,
    data: {
      text: text,
    },
  }];
};

const getPayByDateResponseForHowTheyWantToPay = (claim: Claim, lang: string): ClaimSummarySection[] => {
  return [
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.PART_ADMIT_NOT_PAID.THEY_OFFERED_TO_PAY_YOU_BY_DATE',
        variables: {paidAmount: claim.partialAdmission.howMuchDoYouOwe.amount, datePaid: formatDateToFullDate(claim.partialAdmission.paymentIntention.paymentDate, lang)},
      },
    }];
};

export const getReasonsForWhyCantPayImmediately = (claim: Claim): ClaimSummarySection[] => {
  return [
    {
      type: ClaimSummaryType.SUBTITLE,
      data: {
        text: 'PAGES.REVIEW_DEFENDANTS_RESPONSE.UNABLE_TO_PAY_FULL_AMOUNT',
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: claim.statementOfMeans?.explanation?.text,
      },
    },
  ];
};
export const buildPartAdmitNotPaidResponseContent = (claim: Claim, lng: string): ClaimSummarySection[] => {
  return [
    ...getResponseStatement(claim, lng),
    ...getTheirDefence(claim.partialAdmission.whyDoYouDisagree.text),
    ...getTheirTOEs(claim, lng),
    ...getDisagreementStatementWithTimeline(claim),
    ...getTheirEvidence(claim, lng),
    ...getDisagreementStatementWithEvidence(claim),
  ];
};

export const buildPartAdmitNotPaidResponseForHowTheyWantToPay = (claim: Claim, lng: string): ClaimSummarySection[] => {
  return [
    ...getPayByDateResponseForHowTheyWantToPay(claim, lng),
    ...getReasonsForWhyCantPayImmediately(claim),
  ];
};
