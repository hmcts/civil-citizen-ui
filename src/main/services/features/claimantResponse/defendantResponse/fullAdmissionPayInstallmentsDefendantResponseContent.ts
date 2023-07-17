import {
  ClaimSummarySection,
  ClaimSummaryType,
} from "common/form/models/claimSummarySection";
import {
  constructRepaymentPlanSection,
  repaymentPlanSummary,
} from "../claimantResponseService";
import {Claim} from "common/models/claim";
import {getReasonForNotPayingFullAmount} from "./fullAdmissinionDefendantsResponseContent";

const getResponseSummaryText = (claim: Claim) => {
  const defendantName = claim.getDefendantFullName();
  return [
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: "PAGES.REVIEW_DEFENDANTS_RESPONSE.FULL_ADMISSION_PAY_BY_INSTALLMENTS.DEFENDANT_ADMITS",
        variables: { defendant: defendantName },
      },
    },
    {
      type: ClaimSummaryType.PARAGRAPH,
      data: {
        text: "PAGES.REVIEW_DEFENDANTS_RESPONSE.FULL_ADMISSION_PAY_BY_INSTALLMENTS.THEY_OFFERED_PAY",
      },
    },
  ];
};

export const buildFullAdmissionInstallmentsResponseContent = (claim: Claim, lng: string): ClaimSummarySection[] => {
  return [
    ...getResponseSummaryText(claim),
    ...repaymentPlanSummary(claim, lng),
    ...constructRepaymentPlanSection(claim, lng),
    ...getReasonForNotPayingFullAmount(claim),
  ];
};
